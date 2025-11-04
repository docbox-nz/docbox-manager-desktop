use std::sync::Arc;

use docbox_database::models::tenant::Tenant;
use docbox_management::tenant::{
    create_tenant::CreateTenantConfig,
    delete_tenant::{DeleteTenant, DeleteTenantOptions},
};
use eyre::{Context, ContextCompat};
use tauri::{http::HeaderValue, State};
use uuid::Uuid;

use crate::{commands::CmdResult, database::entity::server::ApiConfig, server::ServerStore};

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

/// Makes a request to the docbox API server telling it to flush its
/// database cache
pub async fn flush_tenant_cache(api: &ApiConfig) -> eyre::Result<()> {
    let client = reqwest::Client::new();

    let url = format!("{}/admin/flush-db-cache", &api.url);
    let mut req_builder = client.post(&url);

    if let Some(api_key) = api.api_key.as_ref() {
        req_builder = req_builder.header(
            reqwest::header::HeaderName::from_static("x-docbox-api-key"),
            HeaderValue::from_str(api_key).context("failed to make header value")?,
        );
    }

    let response = req_builder
        .send()
        .await
        .inspect_err(|error| tracing::error!(?error, "failed to request docbox"))
        .context("failed to request docbox")?;

    response
        .error_for_status()
        .context("error response flushing db cache")?;

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
