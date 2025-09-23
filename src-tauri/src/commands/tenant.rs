use docbox_database::models::tenant::Tenant;
use docbox_management::tenant::create_tenant::CreateTenantConfig;
use eyre::ContextCompat;
use tauri::State;
use uuid::Uuid;

use crate::{commands::CmdResult, server::ServerStore};

/// Create a tenant
#[tauri::command]
pub async fn tenant_create(
    server_store: State<'_, ServerStore>,
    server_id: Uuid,
    config: CreateTenantConfig,
) -> CmdResult<Tenant> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;

    let tenant = docbox_management::tenant::create_tenant::create_tenant(
        &server.db_provider,
        &server.search,
        &server.storage,
        &server.secrets,
        config,
    )
    .await?;

    Ok(tenant)
}

/// List all tenants
#[tauri::command]
pub async fn tenant_get_all(
    server_store: State<'_, ServerStore>,
    server_id: Uuid,
) -> CmdResult<Vec<Tenant>> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;

    let tenants = docbox_management::tenant::get_tenants::get_tenants(&server.db_provider).await?;

    Ok(tenants)
}

/// Create a tenant
#[tauri::command]
pub async fn tenant_get(
    server_store: State<'_, ServerStore>,
    server_id: Uuid,
    env: String,
    tenant_id: Uuid,
) -> CmdResult<Option<Tenant>> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;

    let tenant =
        docbox_management::tenant::get_tenant::get_tenant(&server.db_provider, &env, tenant_id)
            .await?;

    Ok(tenant)
}

/// Delete a tenant
#[tauri::command]
pub async fn tenant_delete(
    server_store: State<'_, ServerStore>,
    server_id: Uuid,
    env: String,
    tenant_id: Uuid,
) -> CmdResult<()> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;

    docbox_management::tenant::delete_tenant::delete_tenant(&server.db_provider, &env, tenant_id)
        .await?;

    Ok(())
}

/// Migrate a tenant
#[tauri::command]
pub async fn tenant_migrate(
    server_store: State<'_, ServerStore>,

    server_id: Uuid,
    env: String,
    tenant_id: Uuid,
) -> CmdResult<()> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;

    let tenant =
        docbox_management::tenant::get_tenant::get_tenant(&server.db_provider, &env, tenant_id)
            .await?
            .context("tenant not found")?;

    docbox_management::tenant::migrate_tenant::migrate_tenant(&server.db_provider, &tenant, None)
        .await?;

    Ok(())
}
