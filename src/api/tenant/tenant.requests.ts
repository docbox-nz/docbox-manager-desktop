import { invoke } from "@tauri-apps/api/core";
import type { CreateTenant, Tenant } from "./tenant.types";

export function getTenants(serverId: string) {
  return invoke<Tenant[]>("tenant_get_all", { serverId });
}

export function getTenant(serverId: string, env: string, tenantId: string) {
  return invoke<Tenant>("tenant_get", { serverId, env, tenantId });
}

export function createTenant(serverId: string, config: CreateTenant) {
  return invoke<Tenant>("tenant_create", {
    serverId,
    config,
  });
}

export function migrateTenant(serverId: string, env: string, tenantId: string) {
  return invoke("tenant_migrate", {
    serverId,
    env,
    tenantId,
  });
}
