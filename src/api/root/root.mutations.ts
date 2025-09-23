import { useMutation } from "@tanstack/react-query";
import { rootKeys } from "./root.keys";
import { initializeRoot, migrateTenants } from "./root.requests";
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
    mutationKey: rootKeys.migrate(serverId),
    mutationFn: () => migrateTenants(serverId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: rootKeys.migrations(serverId),
      });
    },
  });
}
