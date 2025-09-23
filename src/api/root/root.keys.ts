export const rootKeys = {
  isInitialized: (serverId: string) => [serverId, "root", "initialized"],
  initialize: (serverId: string) => [serverId, "root", "initialize"],
  migrate: (serverId: string) => [serverId, "root", "migrate"],
  migrations: (serverId: string) => [serverId, "root", "migrations"],
};
