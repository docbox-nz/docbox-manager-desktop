import { invoke } from "@tauri-apps/api/core";
import { CreateServer, LoadServerConfig, Server } from "./server.types";

export function getServers() {
  return invoke<Server[]>("server_get_all");
}

export function createServer(create: CreateServer) {
  return invoke<Server>("server_create", { create });
}

export function loadServer(serverId: string, loadConfig: LoadServerConfig) {
  return invoke("server_load", { serverId, loadConfig });
}

export function deleteServer(serverId: string) {
  return invoke("server_delete", { serverId });
}
