import { useQuery } from "@tanstack/react-query";
import { serverKeys } from "./server.keys";
import { getServers } from "./server.requests";

export function useServers() {
  return useQuery({
    queryKey: serverKeys.servers,
    queryFn: getServers,
  });
}
