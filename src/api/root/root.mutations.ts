import { useMutation } from "@tanstack/react-query";
import { rootKeys } from "./root.keys";
import { initializeRoot, migrateRoot, migrateTenants } from "./root.requests";
import { queryClient } from "@/integrations/tanstack-query/root-provider";

export function useInitialize(serverId: string) {
  return useMutation({
    mutationKey: rootKeys.initialize(serverId),
    mutationFn: () => initializeRoot(serverId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: rootKeys.isInitialized(serverId),
      });
    },
  });
}

export function useMigrateTenants(serverId: string) {
  return useMutation({
    mutationKey: rootKeys.migrateTenants(serverId),
    mutationFn: () => migrateTenants(serverId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: rootKeys.tenantMigrations(serverId),
      });
    },
  });
}

export function useMigrateRoot(serverId: string) {
  return useMutation({
    mutationKey: rootKeys.migrateRoot(serverId),
    mutationFn: () => migrateRoot(serverId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: rootKeys.rootMigrations(serverId),
      });
    },
  });
}
