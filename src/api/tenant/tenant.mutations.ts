import { useMutation } from "@tanstack/react-query";
import { tenantKeys } from "./tenant.keys";
import { createTenant, migrateTenant } from "./tenant.requests";
import { queryClient } from "@/integrations/tanstack-query/root-provider";
import { rootKeys } from "../root/root.keys";
import { CreateTenant } from "./tenant.types";

export function useCreateTenant(serverId: string) {
  return useMutation({
    mutationKey: tenantKeys.createTenant(serverId),
    mutationFn: (config: CreateTenant) => createTenant(serverId, config),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: tenantKeys.tenants(serverId) });
    },
  });
}

export function useMigrateTenant(serverId: string) {
  return useMutation({
    mutationKey: tenantKeys.migrateTenant(serverId),
    mutationFn: ({ env, tenant_id }: { env: string; tenant_id: string }) =>
      migrateTenant(serverId, env, tenant_id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: rootKeys.migrations(serverId),
      });
    },
  });
}
