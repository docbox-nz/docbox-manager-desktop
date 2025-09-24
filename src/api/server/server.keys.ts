export const serverKeys = {
  servers: ["servers"],
  createServer: ["servers", "create"],
  server: (serverId: string) => ["server", serverId],
  closeServer: (serverId: string) => ["server", serverId, "close"],
  removeServer: (serverId: string) => ["server", serverId, "remove"],
};
