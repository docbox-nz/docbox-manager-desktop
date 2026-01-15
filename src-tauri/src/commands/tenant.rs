use docbox_management::{
    database::models::tenant::Tenant,
    tenant::{
        create_tenant::CreateTenantConfig,
        delete_tenant::{DeleteTenant, DeleteTenantOptions},
        flush_tenant_cache::flush_tenant_cache,
    },
};
use eyre::{Context, ContextCompat};
use std::sync::Arc;
use tauri::State;
use uuid::Uuid;

use crate::{commands::CmdResult, server::ServerStore};

/// Create a tenant
#[tauri::command]
pub async fn tenant_create(
    server_store: State<'_, Arc<ServerStore>>,
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
    server_store: State<'_, Arc<ServerStore>>,
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
    server_store: State<'_, Arc<ServerStore>>,
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
    server_store: State<'_, Arc<ServerStore>>,
    server_id: Uuid,
    env: String,
    tenant_id: Uuid,
    options: Option<DeleteTenantOptions>,
) -> CmdResult<()> {
    let server = server_store
        .get_server(server_id)
        .await
        .context("server not found")?;

    let tenant =
        docbox_management::tenant::get_tenant::get_tenant(&server.db_provider, &env, tenant_id)
            .await?
            .context("tenant not found")?;

    // Must close the connections in advance to ensure the tenant
    // database can be deleted
    server.db_cache.close_tenant_pool(&tenant).await;

    // Tell the API server to flush and close its database pools
    flush_tenant_cache(&server.config.api)
        .await
        .context("failed to flush tenant cache")?;

    docbox_management::tenant::delete_tenant::delete_tenant(
        &server.db_provider,
        &server.search,
        &server.storage,
        &server.events,
        &server.secrets,
        DeleteTenant {
            env,
            tenant_id,
            options: options.unwrap_or_default(),
        },
    )
    .await?;

    Ok(())
}

/// Migrate a tenant
#[tauri::command]
pub async fn tenant_migrate(
    server_store: State<'_, Arc<ServerStore>>,

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
