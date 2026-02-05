import { invoke } from "@tauri-apps/api/core";
import { CreateServer, LoadServerConfig, Server } from "./server.types";
import { ServerConfigData } from "../server";

export function getServers() {
  return invoke<Server[]>("server_get_all");
}

export function createServer(create: CreateServer) {
  return invoke<Server>("server_create", { create });
}

export function loadServer(
  profile: string,
  serverId: string,
  loadConfig: LoadServerConfig,
) {
  return invoke("server_load", { profile, serverId, loadConfig });
}

export function unloadServer(serverId: string) {
  return invoke("server_unload", { serverId });
}

export function deleteServer(serverId: string) {
  return invoke("server_delete", { serverId });
}

export function isServerActive(serverId: string) {
  return invoke<boolean>("server_is_active", { serverId });
}

export function getServerConfig(serverId: string) {
  return invoke<ServerConfigData>("server_get_active_config", { serverId });
}
