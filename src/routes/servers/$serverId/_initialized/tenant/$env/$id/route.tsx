import { getAPIErrorMessage } from "@/api/axios";
import { useTenant } from "@/api/tenant/tenant.queries";
import DocboxProvider from "@/components/docbox/DocboxProvider";
import ErrorPage from "@/components/ErrorPage";
import LoadingPage from "@/components/LoadingPage";
import { TenantContext } from "@/context/tenant-context";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId/_initialized/tenant/$env/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId, env, id } = Route.useParams();

  const {
    data: tenant,
    isLoading: tenantLoading,
    error: tenantError,
  } = useTenant(serverId, env, id);

  if (tenantLoading) {
    return <LoadingPage />;
  }

  if (tenantError || !tenant) {
    return (
      <ErrorPage
        error={`Failed to load tenant: ${getAPIErrorMessage(tenantError)}`}
      />
    );
  }

  return (
    <TenantContext.Provider value={tenant}>
      <DocboxProvider serverId={serverId} tenantId={id} env={env}>
        <Outlet />
      </DocboxProvider>
    </TenantContext.Provider>
  );
}
