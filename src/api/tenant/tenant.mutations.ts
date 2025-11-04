import { useMutation } from "@tanstack/react-query";
import { tenantKeys } from "./tenant.keys";
import { createTenant, deleteTenant, migrateTenant } from "./tenant.requests";
import { queryClient } from "@/integrations/tanstack-query/root-provider";
import { rootKeys } from "../root/root.keys";
import { CreateTenant, DeleteTenantOptions } from "./tenant.types";

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
        queryKey: rootKeys.tenantMigrations(serverId),
      });
    },
  });
}

export function useDeleteTenant(serverId: string) {
  return useMutation({
    mutationKey: tenantKeys.createTenant(serverId),
    mutationFn: ({
      env,
      tenantId,
      config,
    }: {
      env: string;
      tenantId: string;
      config: DeleteTenantOptions;
    }) => deleteTenant(serverId, env, tenantId, config),
    onSuccess(_tenant, { env, tenantId }) {
      queryClient.invalidateQueries({ queryKey: tenantKeys.tenants(serverId) });
      queryClient.invalidateQueries({
        queryKey: tenantKeys.tenant(serverId, env, tenantId),
      });
    },
  });
}
