import type { MigrationsResponse } from "./root.types";

import { invoke } from "@tauri-apps/api/core";

export function isInitialized(serverId: string) {
  return invoke<boolean>("root_is_initialized", { serverId });
}

export function getTenantsMigrations(serverId: string) {
  return invoke<MigrationsResponse>("root_get_pending_tenants_migrations", {
    serverId,
  });
}
export function getRootMigrations(serverId: string) {
  return invoke<string[]>("root_get_pending_migrations", {
    serverId,
  });
}

export function initializeRoot(serverId: string) {
  return invoke<{}>("root_initialize", { serverId });
}

export function migrateTenants(serverId: string) {
  return invoke("root_apply_tenant_migrations", {
    serverId,
    config: { skip_failed: true },
  });
}

export function migrateRoot(serverId: string) {
  return invoke("root_apply_migrations", {
    serverId,
  });
}
