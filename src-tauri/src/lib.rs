use std::{error::Error, sync::Arc};

use eyre::Context;
use tauri::{
    async_runtime::{block_on, spawn},
    App, Manager,
};

use crate::{gateway::handle_gateway_request, server::ServerStore};

pub mod commands;
pub mod database;
pub mod gateway;
pub mod server;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .register_asynchronous_uri_scheme_protocol("docbox", |ctx, request, responder| {
            let app = ctx.app_handle();
            let server_store = app.state::<Arc<ServerStore>>().inner().clone();

            spawn(async move {
                let response = handle_gateway_request(server_store, request).await;
                responder.respond(response);
            });
        })
        .setup(setup)
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup(app: &mut App) -> Result<(), Box<dyn Error>> {
    let app_data_path = app
        .path()
        .app_data_dir()
        .context("failed to get app data dir")?;

    let db = match block_on(database::connect_database(app_data_path.join("app.db"))) {
        Ok(value) => value,
        Err(cause) => {
            tracing::error!(?cause, "failed to load database");
            std::process::exit(1);
        }
    };

    let store = Arc::new(ServerStore::default());

    app.manage(store);
    app.manage(db);

    Ok(())
}
