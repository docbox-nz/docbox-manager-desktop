export const rootKeys = {
  isInitialized: (serverId: string) => [serverId, "root", "initialized"],
  initialize: (serverId: string) => [serverId, "root", "initialize"],
  migrateTenants: (serverId: string) => [
    serverId,
    "root",
    "tenants",
    "migrate",
  ],
  migrateRoot: (serverId: string) => [serverId, "root", "root", "migrate"],
  tenantMigrations: (serverId: string) => [
    serverId,
    "root",
    "tenants",
    "migrations",
  ],
  rootMigrations: (serverId: string) => [
    serverId,
    "root",
    "root",
    "migrations",
  ],
};
