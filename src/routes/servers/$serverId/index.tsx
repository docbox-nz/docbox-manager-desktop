import { getAPIErrorMessage } from "@/api/axios";
import { getServers } from "@/api/server/server.requests";
import { useTenants } from "@/api/tenant/tenant.queries";
import LoadingPage from "@/components/LoadingPage";
import PendingMigrationsLoader from "@/components/PendingMigrationsLoader";
import RouterLink from "@/components/RouterLink";
import { useTenantFiltersStore } from "@/features/tenants/tenants-table-filter-state";
import TenantsTable from "@/features/tenants/TenantsTable";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute, notFound } from "@tanstack/react-router";
import MdiChevronLeft from "~icons/mdi/chevron-left";
import { useShallow } from "zustand/react/shallow";
import TenantTableFilters from "@/features/tenants/TenantsTableFilters";
import { useMemo } from "react";
import TenantsTableActiveFilters from "@/features/tenants/TenantsTableActiveFilters";

export const Route = createFileRoute("/servers/$serverId/")({
  component: RouteComponent,
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
  const { serverId } = Route.useParams();
  const { server } = Route.useLoaderData();
  const {
    data: tenantsData,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useTenants(serverId);

  const tenants = useMemo(() => tenantsData ?? [], [tenantsData]);

  const { query, environments, setQuery, setEnvironments } =
    useTenantFiltersStore(
      useShallow((state) => ({
        query: state.query,
        environments: state.environments,

        setQuery: state.setQuery,
        setEnvironments: state.setEnvironments,
      }))
    );

  const availableEnvironments = useMemo(() => {
    return Array.from(
      tenants.reduce((environments, tenant) => {
        environments.add(tenant.env);
        return environments;
      }, new Set<string>())
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

  return (
    <>
      <Card sx={{ m: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center">
              <IconButton
                size="small"
                sx={{ mr: 1 }}
                component={RouterLink}
                to="/"
              >
                <MdiChevronLeft width={32} height={32} />
              </IconButton>
              <Typography variant="h4">{server.name}</Typography>
            </Stack>

            <PendingMigrationsLoader serverId={serverId} />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 1, py: 1 }}
            >
              <Typography variant="h6">Tenants</Typography>
              <Button
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
    </>
  );
}
