use crate::database::{DbExecutor, DbResult};
use docbox_database::DbErr;
use docbox_search::SearchIndexFactoryConfig;
use docbox_secrets::SecretsManagerConfig;
use docbox_storage::StorageLayerFactoryConfig;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

pub type ServerId = Uuid;

#[derive(Clone, FromRow, Serialize)]
pub struct Server {
    /// Unique ID for the server
    pub id: ServerId,
    /// Name for the server
    pub name: String,
    /// Server configuration (Not sent to the UI)
    #[sqlx(json)]
    #[serde(skip)]
    pub config: ServerConfig,
    /// Order the server is displayed in the UI
    pub order: u32,
}

#[derive(Serialize, Deserialize)]
pub struct CreateServer {
    pub id: ServerId,
    pub name: String,
    pub config: ServerConfig,
    pub order: u32,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[allow(clippy::large_enum_variant)]
pub enum ServerConfig {
    /// Config is stored in an AWS secret
    AwsSecret { secret_name: String },

    /// Config is stored directly
    Config { data: ServerConfigData },

    /// Config is stored as an encrypted blob
    Encrypted { encrypted: Vec<u8> },
}

#[derive(Clone, Deserialize, Serialize)]
pub struct AdminDatabaseConfiguration {
    pub host: String,
    pub port: u16,
    pub setup_user: Option<AdminDatabaseSetupUserConfig>,
    pub setup_user_secret_name: Option<String>,
    pub root_secret_name: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct AdminDatabaseSetupUserConfig {
    #[serde(alias = "user")]
    pub username: String,
    pub password: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ServerConfigData {
    pub api_url: String,
    pub database: AdminDatabaseConfiguration,
    pub secrets: SecretsManagerConfig,
    pub search: SearchIndexFactoryConfig,
    pub storage: StorageLayerFactoryConfig,
}

impl Server {
    /// Create a new server
    pub async fn create(db: impl DbExecutor<'_>, create: CreateServer) -> DbResult<Server> {
        let config_value =
            serde_json::to_value(&create.config).map_err(|error| DbErr::Encode(Box::new(error)))?;

        sqlx::query(
            r#"
            INSERT INTO "servers" ("id", "name", "config", "order")
            VALUES ($1, $2, $3, $4)
        "#,
        )
        .bind(create.id)
        .bind(create.name.as_str())
        .bind(config_value)
        .bind(create.order)
        .execute(db)
        .await?;

        Ok(Server {
            id: create.id,
            name: create.name,
            config: create.config,
            order: create.order,
        })
    }

    /// Finds all servers
    pub async fn all(db: impl DbExecutor<'_>) -> DbResult<Vec<Server>> {
        sqlx::query_as(r#"SELECT * FROM "servers""#)
            .fetch_all(db)
            .await
    }

    /// Find a server by `id`
    pub async fn find_by_id(db: impl DbExecutor<'_>, id: ServerId) -> DbResult<Option<Server>> {
        sqlx::query_as(r#"SELECT * FROM "servers" WHERE "id" = $1"#)
            .bind(id)
            .fetch_optional(db)
            .await
    }
}
