use crate::{
    database::entity::server::{Server, ServerConfig, ServerId},
    utils::{aws::get_aws_profiles, encryption::decrypt},
};
use docbox_management::{
    config::{load_server_config_data_secret, ServerConfigData, ServerConfigDataSecretError},
    core::{
        aws::{aws_config, aws_config_with_profile},
        events::EventPublisherFactory,
        search::SearchIndexFactory,
        secrets::SecretManager,
        storage::StorageLayerFactory,
    },
    database::{DatabasePoolCache, ServerDatabaseProvider},
    server::{load_managed_server, LoadManagedServerError},
};

use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use thiserror::Error;
use tokio::sync::Mutex;

/// Active server connections
#[derive(Default)]
pub struct ServerStore {
    servers: Mutex<HashMap<ServerId, Arc<ActiveServer>>>,
}

impl ServerStore {
    pub async fn try_load_server(
        &self,
        profile: Option<String>,
        server: Server,
        load_config: LoadServerConfig,
    ) -> Result<Arc<ActiveServer>, LoadServerError> {
        let servers = &mut *self.servers.lock().await;
        let server = load_server(profile, server, load_config).await?;
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
    #[error("failed to get available aws profiles")]
    GetAwsProfiles,

    #[error("unable to locate requested AWS profile")]
    AwsProfileNotFound,

    #[error(transparent)]
    LoadManagedServer(#[from] LoadManagedServerError),

    #[error("server config is encrypted")]
    MissingPassword,

    #[error("server config password is incorrect")]
    IncorrectPassword,

    #[error("failed to load server config secret: {0}")]
    LoadFromSecret(#[from] ServerConfigDataSecretError),

    #[error("failed to deserialize config")]
    Deserialize(serde_json::Error),
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LoadServerConfig {
    pub password: Option<String>,
}

pub async fn load_server(
    profile: Option<String>,
    server: Server,
    load_config: LoadServerConfig,
) -> Result<ActiveServer, LoadServerError> {
    let aws_config = match profile.as_deref() {
        // Default profile
        Some("default") | None => aws_config().await,

        // Custom user profile
        Some(profile) => {
            let profiles = get_aws_profiles()
                .await
                .map_err(|_| LoadServerError::GetAwsProfiles)?;

            if !profiles.contains(&profile.to_string()) {
                return Err(LoadServerError::AwsProfileNotFound);
            }

            aws_config_with_profile(profile).await
        }
    };

    let config: ServerConfigData = match server.config {
        // Load secret from AWS
        ServerConfig::AwsSecret { secret_name } => {
            load_server_config_data_secret(&aws_config, &secret_name).await?
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

    let managed_server = load_managed_server(&aws_config, &config).await?;

    Ok(ActiveServer {
        id: server.id,
        name: server.name,
        config,
        db_provider: managed_server.db_provider,
        db_cache: managed_server.db_cache,
        secrets: managed_server.secrets,
        search: managed_server.search,
        storage: managed_server.storage,
        events: managed_server.events,
    })
}

pub struct ActiveServer {
    pub id: ServerId,
    pub name: String,
    pub config: ServerConfigData,
    //
    pub db_provider: ServerDatabaseProvider,
    //
    pub db_cache: Arc<DatabasePoolCache>,
    pub secrets: SecretManager,
    pub search: SearchIndexFactory,
    pub storage: StorageLayerFactory,
    pub events: EventPublisherFactory,
}
