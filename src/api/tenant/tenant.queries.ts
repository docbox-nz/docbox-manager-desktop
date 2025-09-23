import { useQuery } from "@tanstack/react-query";
import { tenantKeys } from "./tenant.keys";
import { getTenant, getTenants } from "./tenant.requests";

export function useTenants(serverId: string) {
  return useQuery({
    queryKey: tenantKeys.tenants(serverId),
    queryFn: () => getTenants(serverId),
  });
}

export function useTenant(serverId: string, env: string, tenantId: string) {
  return useQuery({
    queryKey: tenantKeys.tenant(serverId, env, tenantId),
    queryFn: () => getTenant(serverId, env, tenantId),
  });
}
