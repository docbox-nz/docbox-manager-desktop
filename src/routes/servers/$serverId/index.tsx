import { getAPIErrorMessage } from "@/api/axios";
import { getServers } from "@/api/server/server.requests";
import { useTenants } from "@/api/tenant/tenant.queries";
import LoadingPage from "@/components/LoadingPage";
import RouterLink from "@/components/RouterLink";
import { useTenantFiltersStore } from "@/features/tenants/tenants-table-filter-state";
import TenantsTable from "@/features/tenants/TenantsTable";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useShallow } from "zustand/react/shallow";
import TenantTableFilters from "@/features/tenants/TenantsTableFilters";
import { useMemo } from "react";
import TenantsTableActiveFilters from "@/features/tenants/TenantsTableActiveFilters";
import { z } from "zod/v4";
import DeleteTenantDialog from "@/features/tenant/DeleteTenantDialog";
import Button from "@mui/material/Button";
import ServerToolbar from "@/components/ServerToolbar";
import { useServerContext } from "@/context/server-context";

const searchSchema = z.object({
  deleteTenantId: z.string().optional(),
});

export const Route = createFileRoute("/servers/$serverId/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loader: async ({ params }) => {
    const servers = await getServers();
    const server = servers.find((server) => server.id === params.serverId);
    if (server == undefined) {
      throw notFound();
    }

    return { server };
  },
  pendingComponent: () => <LoadingPage message="Loading server..." />,
});

function RouteComponent() {
  const server = useServerContext();

  const navigate = Route.useNavigate();
  const { serverId } = Route.useParams();
  const { deleteTenantId } = Route.useSearch();
  const {
    data: tenantsData,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useTenants(serverId);

  const tenants = useMemo(() => tenantsData ?? [], [tenantsData]);

  const deleteTenant = useMemo(() => {
    if (!deleteTenantId) return undefined;
    return tenants.find((tenant) => tenant.id === deleteTenantId);
  }, [tenants, deleteTenantId]);

  const { query, environments, setQuery, setEnvironments } =
    useTenantFiltersStore(
      useShallow((state) => ({
        query: state.query,
        environments: state.environments,

        setQuery: state.setQuery,
        setEnvironments: state.setEnvironments,
      })),
    );

  const availableEnvironments = useMemo(() => {
    return Array.from(
      tenants.reduce((environments, tenant) => {
        environments.add(tenant.env);
        return environments;
      }, new Set<string>()),
    );
  }, [tenants]);

  const normalizedQuery = useMemo(() => query.toLowerCase().trim(), [query]);
  const filtersApplied = normalizedQuery.length > 0 || environments.length > 0;

  const filteredTenants = useMemo(() => {
    // No filters applied
    if (!filtersApplied) {
      return tenants;
    }

    const queryApplied = normalizedQuery.length > 0;
    const envApplied = environments.length > 0;

    return tenants.filter((tenant) => {
      if (queryApplied) {
        const name = tenant.name.toLowerCase().trim();
        if (!name.includes(normalizedQuery)) return false;
      }

      if (envApplied && !environments.includes(tenant.env)) {
        return false;
      }

      return true;
    });
  }, [filtersApplied, tenants, query, environments]);

  const onCloseDelete = () =>
    navigate({
      to: ".",
      search: (search) => ({ ...search, deleteTenantId: undefined }),
    });

  return (
    <>
      <ServerToolbar server={server} />

      <Card sx={{ m: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 1, py: 1 }}
            >
              <Typography variant="h6">Tenants</Typography>

              <Button
                variant="contained"
                component={RouterLink}
                to="/servers/$serverId/tenant/create"
                params={{ serverId }}
              >
                Create Tenant
              </Button>
            </Stack>

            {tenantsError && (
              <Alert severity="error">
                Failed to load tenants: {getAPIErrorMessage(tenantsError)}
              </Alert>
            )}

            <TenantTableFilters
              query={query}
              environments={environments}
              availableEnvironments={availableEnvironments}
              setQuery={setQuery}
              setEnvironments={setEnvironments}
            />

            {filtersApplied && (
              <TenantsTableActiveFilters
                query={query}
                environments={environments}
                filteredResults={filteredTenants.length}
                setQuery={setQuery}
                setEnvironments={setEnvironments}
              />
            )}

            <TenantsTable tenants={filteredTenants} loading={tenantsLoading} />
          </Stack>
        </CardContent>
      </Card>

      {deleteTenant && (
        <DeleteTenantDialog
          open
          onClose={onCloseDelete}
          serverId={serverId}
          tenant={deleteTenant}
        />
      )}
    </>
  );
}
