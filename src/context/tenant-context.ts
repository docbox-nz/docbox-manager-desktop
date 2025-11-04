import { Tenant } from "@/api/tenant/tenant.types";
import { createContext, useContext } from "react";

export const TenantContext = createContext<Tenant>(null!);

export function useTenantContext() {
  return useContext(TenantContext);
}
