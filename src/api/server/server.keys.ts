export const serverKeys = {
  servers: ["servers"],
  createServer: ["servers", "create"],

  server: {
    root: (serverId: string) => ["server", serverId],
    active: (serverId: string) => ["server", serverId, "active"],
    close: (serverId: string) => ["server", serverId, "close"],
    remove: (serverId: string) => ["server", serverId, "remove"],
  },
};
