import { Channel, invoke } from "@tauri-apps/api/core";
import {
  CreateServer,
  LoadServerConfig,
  Server,
  StorageVerifyOutcome,
} from "./server.types";

export function getServers() {
  return invoke<Server[]>("server_get_all");
}

export function createServer(create: CreateServer) {
  return invoke<Server>("server_create", { create });
}

export function loadServer(serverId: string, loadConfig: LoadServerConfig) {
  return invoke("server_load", { serverId, loadConfig });
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

export function verifyServerStorage(
  serverId: string,
  onEvent: Channel<StorageVerifyOutcome>
) {
  return invoke<StorageVerifyOutcome>("server_verify_storage", {
    serverId,
    onEvent,
  });
}
