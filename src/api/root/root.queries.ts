import { useQuery } from "@tanstack/react-query";
import { rootKeys } from "./root.keys";
import { getRootMigrations, getTenantsMigrations } from "./root.requests";

export function useTenantsMigrations(serverId: string) {
  return useQuery({
    queryKey: rootKeys.tenantMigrations(serverId),
    queryFn: () => getTenantsMigrations(serverId),
  });
}

export function useRootMigrations(serverId: string) {
  return useQuery({
    queryKey: rootKeys.rootMigrations(serverId),
    queryFn: () => getRootMigrations(serverId),
  });
}
