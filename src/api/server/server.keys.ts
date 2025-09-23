export const serverKeys = {
  servers: ["servers"],
  createServer: ["servers", "create"],
  server: (serverId: string) => serverId,
  closeServer: (serverId: string) => serverId,
  removeServer: (serverId: string) => serverId,
};
