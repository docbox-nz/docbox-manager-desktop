import type { MigrationsResponse } from "./root.types";

import { invoke } from "@tauri-apps/api/core";

export function isInitialized(serverId: string) {
  return invoke<boolean>("root_is_initialized", { serverId });
}

export function getMigrations(serverId: string) {
  return invoke<MigrationsResponse>("root_get_pending_migrations", {
    serverId,
  });
}

export function initializeRoot(serverId: string) {
  return invoke<{}>("root_initialize", { serverId });
}

export function migrateTenants(serverId: string) {
  return invoke("root_apply_migrations", {
    serverId,
    config: { skip_failed: true },
  });
}
