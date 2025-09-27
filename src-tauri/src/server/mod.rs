use std::{collections::HashMap, future::Future, sync::Arc};

use aws_config::SdkConfig;
use docbox_database::{DatabasePoolCache, DatabasePoolCacheConfig};
use docbox_search::{SearchIndexFactory, SearchIndexFactoryError};
use docbox_secrets::{SecretManager, SecretManagerError, SecretsManagerConfig};
use docbox_storage::StorageLayerFactory;
use moka::future::Cache;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::sync::Mutex;

use crate::{
    database::entity::server::{
        AdminDatabaseConfiguration, AdminDatabaseSetupUserConfig, Server, ServerConfig,
        ServerConfigData, ServerId,
    },
    utils::encryption::decrypt,
};

/// Active server connections
#[derive(Default)]
pub struct ServerStore {
    servers: Mutex<HashMap<ServerId, Arc<ActiveServer>>>,
}

impl ServerStore {
    pub async fn try_load_server(
        &self,
        aws_config: &SdkConfig,
        server: Server,
        load_config: LoadServerConfig,
    ) -> Result<Arc<ActiveServer>, LoadServerError> {
        let servers = &mut *self.servers.lock().await;
        let server = load_server(aws_config, server, load_config).await?;
        let server = Arc::new(server);
        servers.insert(server.id, server.clone());
        Ok(server)
    }

    pub async fn get_server(&self, server_id: ServerId) -> Option<Arc<ActiveServer>> {
        self.servers.lock().await.get(&server_id).cloned()
    }

    pub async fn get_servers(&self) -> Vec<Arc<ActiveServer>> {
        self.servers.lock().await.values().cloned().collect()
    }

    pub async fn remove_server(&self, server_id: ServerId) {
        self.servers.lock().await.remove(&server_id);
    }
}

#[derive(Debug, Error)]
pub enum LoadServerError {
    #[error("server config is encrypted")]
    MissingPassword,

    #[error("server config password is incorrect")]
    IncorrectPassword,

    #[error("failed to load server config secret: {0}")]
    SecretManager(#[from] SecretManagerError),

    #[error("server config secret not found")]
    MissingSecret,

    #[error("server config database setup user secret not found")]
    MissingDatabaseSecret,

    #[error("must provided either setup_user or setup_user_secret_name in database config")]
    MissingSetupUser,

    #[error("failed to create search index factory: {0}")]
    CreateSearchFactory(#[from] SearchIndexFactoryError),

    #[error("failed to deserialize config")]
    Deserialize(serde_json::Error),
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LoadServerConfig {
    pub password: Option<String>,
}

pub async fn load_server(
    aws_config: &SdkConfig,
    server: Server,
    load_config: LoadServerConfig,
) -> Result<ActiveServer, LoadServerError> {
    let config: ServerConfigData = match server.config {
        // Load secret from AWS
        ServerConfig::AwsSecret { secret_name } => {
            let secrets = SecretManager::from_config(aws_config, SecretsManagerConfig::Aws);
            secrets
                .parsed_secret(&secret_name)
                .await?
                .ok_or(LoadServerError::MissingSecret)?
        }

        // Secret is directly available
        ServerConfig::Config { data } => data,

        // Secret must be decrypted
        ServerConfig::Encrypted { salt, nonce, data } => {
            let password = match load_config.password {
                Some(value) => value,
                None => return Err(LoadServerError::MissingPassword),
            };

            // Decrypt the content
            let decrypted = match decrypt(password.as_bytes(), &salt, &nonce, &data) {
                Ok(value) => value,
                Err(_) => return Err(LoadServerError::IncorrectPassword),
            };

            serde_json::from_slice(&decrypted).map_err(LoadServerError::Deserialize)?
        }
    };

    // Setup server secret manager
    let secrets = SecretManager::from_config(aws_config, config.secrets.clone());
    let secrets = Arc::new(secrets);

    // Setup database cache / connector
    let db_cache = Arc::new(DatabasePoolCache::from_config(
        DatabasePoolCacheConfig {
            host: config.database.host.clone(),
            port: config.database.port,
            root_secret_name: config.database.root_secret_name.clone(),
            max_connections: None,
        },
        secrets.clone(),
    ));

    // Setup search factory
    let search = SearchIndexFactory::from_config(
        aws_config,
        secrets.clone(),
        db_cache.clone(),
        config.search.clone(),
    )?;

    // Setup storage factory
    let storage = StorageLayerFactory::from_config(aws_config, config.storage.clone());

    let db_provider = match (
        config.database.setup_user.as_ref(),
        config.database.setup_user_secret_name.as_deref(),
    ) {
        (Some(setup_user), _) => DatabaseProvider {
            config: config.database.clone(),
            username: setup_user.username.clone(),
            password: setup_user.password.clone(),
        },
        (_, Some(setup_user_secret_name)) => {
            let secret: AdminDatabaseSetupUserConfig = secrets
                .parsed_secret(setup_user_secret_name)
                .await?
                .ok_or(LoadServerError::MissingDatabaseSecret)?;

            tracing::debug!("loaded database secrets from secret manager");

            DatabaseProvider {
                config: config.database.clone(),
                username: secret.username.clone(),
                password: secret.password.clone(),
            }
        }
        (None, None) => {
            return Err(LoadServerError::MissingSetupUser);
        }
    };

    Ok(ActiveServer {
        id: server.id,
        name: server.name,
        config,
        db_provider,
        db_cache,
        secrets,
        search,
        storage,
    })
}

pub struct ActiveServer {
    pub id: ServerId,
    pub name: String,
    pub config: ServerConfigData,
    //
    pub db_provider: DatabaseProvider,
    //
    pub db_cache: Arc<DatabasePoolCache>,
    pub secrets: Arc<SecretManager>,
    pub search: SearchIndexFactory,
    pub storage: StorageLayerFactory,
}

pub struct DatabaseProvider {
    pub config: AdminDatabaseConfiguration,
    pub username: String,
    pub password: String,
}

impl docbox_management::database::DatabaseProvider for DatabaseProvider {
    fn connect(
        &self,
        database: &str,
    ) -> impl Future<Output = docbox_database::DbResult<docbox_database::DbPool>> + Send {
        let options = docbox_database::PgConnectOptions::new()
            .host(&self.config.host)
            .port(self.config.port)
            .username(&self.username)
            .password(&self.password)
            .database(database);

        docbox_database::sqlx::PgPool::connect_with(options)
    }
}
