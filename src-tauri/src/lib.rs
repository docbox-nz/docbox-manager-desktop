use std::{error::Error, sync::Arc};

use docbox_core::aws::aws_config;
use eyre::Context;
use tauri::{
    async_runtime::{block_on, spawn},
    App, Manager,
};

use crate::{gateway::handle_gateway_request, server::ServerStore};

pub mod commands;
pub mod database;
pub mod gateway;
pub mod logging;
pub mod server;
pub mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use commands::{
        root::{
            root_apply_migrations, root_get_pending_migrations, root_initialize,
            root_is_initialized,
        },
        server::{
            server_create, server_delete, server_get_active, server_get_all, server_is_active,
            server_load, server_unload,
        },
        tenant::{tenant_create, tenant_delete, tenant_get, tenant_get_all, tenant_migrate},
        utils::utils_encrypt,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
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
        .invoke_handler(tauri::generate_handler![
            server_create,
            server_get_all,
            server_load,
            server_unload,
            server_is_active,
            server_get_active,
            server_delete,
            root_is_initialized,
            root_initialize,
            root_get_pending_migrations,
            root_apply_migrations,
            tenant_create,
            tenant_delete,
            tenant_get,
            tenant_get_all,
            tenant_migrate,
            utils_encrypt
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup(app: &mut App) -> Result<(), Box<dyn Error>> {
    // Load environment variables
    _ = dotenvy::dotenv();

    logging::init_logging();

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

    // Load AWS configuration
    let aws_config = block_on(aws_config());

    let store = Arc::new(ServerStore::default());

    app.manage(aws_config);
    app.manage(store);
    app.manage(db);

    Ok(())
}
