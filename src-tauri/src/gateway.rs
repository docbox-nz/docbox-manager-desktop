use std::sync::Arc;

use itertools::Itertools;
use tauri::http::{self, Response};
use uuid::Uuid;

use crate::server::ServerStore;

/// Handle requests to the docbox protocol
///
/// docbox://gateway/xxxxxxxxxxx/box/xxxxxxxx/search
///                 |- Server -|--- Docbox Path ---|
///
pub async fn handle_gateway_request(
    server_store: Arc<ServerStore>,
    request: http::Request<Vec<u8>>,
) -> http::Response<Vec<u8>> {
    let (parts, body) = request.into_parts();

    let path = parts.uri.path();
    let mut path_parts = path.split('/');

    // Get the server ID
    let server_id = path_parts.next().expect("request missing server ID");
    let server_id: Uuid = server_id.parse().expect("invalid server id");

    // Collect all remaining parts into the new path
    let path = path_parts.join("/");

    let server = server_store
        .get_server(server_id)
        .await
        .expect("server not found");

    // Rebuild the URI without the stripped prefix
    let query = parts
        .uri
        .query()
        .map(|q| format!("?{q}"))
        .unwrap_or_default();
    let new_uri = format!("{}{}{}", &server.config.api_url, path, query);

    let client = reqwest::Client::new();

    // Build the request with headers and body
    let mut req_builder = client.request(parts.method.clone(), new_uri).body(body);

    if let Some(header) = parts.headers.get("accept") {
        req_builder = req_builder.header(reqwest::header::ACCEPT, header);
    }
    if let Some(header) = parts.headers.get("content-type") {
        req_builder = req_builder.header(reqwest::header::CONTENT_TYPE, header);
    }
    if let Some(header) = parts.headers.get("content-length") {
        req_builder = req_builder.header(reqwest::header::CONTENT_LENGTH, header);
    }

    let resp = req_builder
        .send()
        .await
        .inspect_err(|error| tracing::error!(?error, "failed to request docbox"))
        .expect("failed to request docbox");

    // Build axum response
    let mut response_builder = Response::builder().status(resp.status());

    for (key, value) in resp.headers().iter() {
        response_builder = response_builder.header(key, value);
    }

    let body = resp.bytes().await.expect("failed to ready body").to_vec();

    let response = response_builder
        .body(body)
        .inspect_err(|error| tracing::error!(?error, "failed to create response"))
        .expect("failed to create response");

    tracing::debug!("HERES THE RESPONSE");

    response
}
