export const tenantKeys = {
  tenants: (serverId: string) => ["server", serverId, "tenant", "list"],
  createTenant: (serverId: string) => ["server", serverId, "tenant", "create"],
  migrateTenant: (serverId: string) => [
    "server",
    serverId,
    "tenant",
    "migrate",
  ],
  tenant: (serverId: string, env: string, tenantId: string) => [
    "server",
    serverId,
    "tenant",
    env,
    tenantId,
  ],
};
