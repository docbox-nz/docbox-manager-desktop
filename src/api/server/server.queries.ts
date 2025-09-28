import { useQuery } from "@tanstack/react-query";
import { serverKeys } from "./server.keys";
import { getServers, isServerActive } from "./server.requests";

export function useServers() {
  return useQuery({
    queryKey: serverKeys.servers,
    queryFn: getServers,
  });
}

export function useServerActive(serverId: string) {
  return useQuery({
    queryKey: serverKeys.server.active(serverId),
    queryFn: () => isServerActive(serverId),
  });
}
