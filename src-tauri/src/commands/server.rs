use std::ops::Deref;

use aws_config::SdkConfig;
use eyre::{Context, ContextCompat};
use tauri::State;
use uuid::Uuid;

use crate::{
    commands::CmdResult,
    database::entity::server::{CreateServer, Server, ServerId},
    server::ServerStore,
};

/// Create a server
#[tauri::command]
pub async fn server_create(
    db: State<'_, crate::database::DbPool>,
    create: CreateServer,
) -> CmdResult<Server> {
    let server = Server::create(db.deref(), create).await?;

    Ok(server)
}

/// Get all servers
#[tauri::command]
pub async fn server_get_all(db: State<'_, crate::database::DbPool>) -> CmdResult<Vec<Server>> {
    let servers = Server::all(db.deref()).await?;

    Ok(servers)
}

/// Try load a server and make it active
#[tauri::command]
pub async fn server_load(
    db: State<'_, crate::database::DbPool>,
    server_store: State<'_, ServerStore>,
    sdk_config: State<'_, SdkConfig>,
    server_id: Uuid,
    load_config: crate::server::LoadServerConfig,
) -> CmdResult<()> {
    let server = Server::find_by_id(db.deref(), server_id)
        .await?
        .context("server not found")?;

    let _server = server_store
        .try_load_server(&sdk_config, server, load_config)
        .await
        .context("server not found")?;

    Ok(())
}

/// Unload a server
#[tauri::command]
pub async fn server_unload(server_store: State<'_, ServerStore>, server_id: Uuid) -> CmdResult<()> {
    server_store.remove_server(server_id).await;

    Ok(())
}

/// Check if the server is active
#[tauri::command]
pub async fn server_is_active(
    server_store: State<'_, ServerStore>,
    server_id: Uuid,
) -> CmdResult<bool> {
    let server = server_store.get_server(server_id).await;
    Ok(server.is_some())
}

/// Get a list of currently active servers
#[tauri::command]
pub async fn server_get_active(server_store: State<'_, ServerStore>) -> CmdResult<Vec<ServerId>> {
    let server = server_store.get_servers().await;
    Ok(server.into_iter().map(|server| server.id).collect())
}
