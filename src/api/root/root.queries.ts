import { useQuery } from "@tanstack/react-query";
import { rootKeys } from "./root.keys";
import { getMigrations, isInitialized } from "./root.requests";

export function useInitialized(serverId: string) {
  return useQuery({
    queryKey: rootKeys.isInitialized(serverId),
    queryFn: () => isInitialized(serverId),
  });
}

export function useMigrations(serverId: string) {
  return useQuery({
    queryKey: rootKeys.migrations(serverId),
    queryFn: () => getMigrations(serverId),
  });
}
