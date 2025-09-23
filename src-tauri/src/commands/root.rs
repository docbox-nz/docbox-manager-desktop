use docbox_database::models::tenant::Tenant;
use docbox_management::tenant::{migrate_tenants::MigrateTenantsConfig, MigrateTenantsOutcome};
use eyre::ContextCompat;
use futures::{stream::FuturesOrdered, TryStreamExt};
use serde::Serialize;
use tauri::State;
use uuid::Uuid;

use crate::{commands::CmdResult, server::ServerStore};

/// Check if the provided server is initialized
#[tauri::command]
pub async fn root_is_initialized(
    server_store: State<'_, ServerStore>,
    server_id: Uuid,
) -> CmdResult<bool> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;
    let initialized =
        docbox_management::root::initialize::is_initialized(&server.db_provider).await?;

    Ok(initialized)
}

/// Initialize the provided server
#[tauri::command]
pub async fn root_initialize(
    server_store: State<'_, ServerStore>,
    server_id: Uuid,
) -> CmdResult<()> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;
    docbox_management::root::initialize::initialize(
        &server.db_provider,
        &server.secrets,
        &server.db_provider.config.root_secret_name,
    )
    .await?;

    todo!()
}

#[derive(Serialize)]
pub struct TenantWithMigrations {
    pub tenant: Tenant,
    pub migrations: Vec<String>,
}

/// Initialize the provided server
#[tauri::command]
pub async fn root_get_pending_migrations(
    server_store: State<'_, ServerStore>,
    server_id: Uuid,
) -> CmdResult<Vec<TenantWithMigrations>> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;

    let tenants = docbox_management::tenant::get_tenants::get_tenants(&server.db_provider).await?;

    let tenant_with_migrations = tenants
        .into_iter()
        .map(|tenant|{
            async {
                let pending = docbox_management::tenant::get_pending_tenant_migrations::get_pending_tenant_migrations(&server.db_provider, &tenant).await?;

                eyre::Ok(TenantWithMigrations{
                    tenant,
                    migrations: pending
                })
            }
        })
        .collect::<FuturesOrdered<_>>()
        .try_collect::<Vec<TenantWithMigrations>>()
        .await?;

    Ok(tenant_with_migrations)
}

/// Apply migrations on the server
#[tauri::command]
pub async fn root_apply_migrations(
    server_store: State<'_, ServerStore>,
    server_id: Uuid,
    config: MigrateTenantsConfig,
) -> CmdResult<MigrateTenantsOutcome> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;

    let outcome =
        docbox_management::tenant::migrate_tenants::migrate_tenants(&server.db_provider, config)
            .await?;

    Ok(outcome)
}
