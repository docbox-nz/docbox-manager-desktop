import { getAPIErrorMessage } from "@/api/axios";
import { getServers } from "@/api/server/server.requests";
import { useTenants } from "@/api/tenant/tenant.queries";
import { Tenant } from "@/api/tenant/tenant.types";
import LoadingPage from "@/components/LoadingPage";
import PendingMigrationsLoader from "@/components/PendingMigrationsLoader";
import RouterLink from "@/components/RouterLink";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { createFileRoute, notFound } from "@tanstack/react-router";
import MdiChevronLeft from "~icons/mdi/chevron-left";

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

const columns: GridColDef<Tenant>[] = [
  {
    field: "id",
    width: 300,
    headerName: "ID",
  },
  {
    field: "name",
    flex: 1,
    headerName: "Name",
  },
  {
    field: "env",
    headerName: "Environment",
  },
  {
    field: "db_name",
    width: 300,
    headerName: "Database Name",
  },
  {
    field: "s3_name",
    width: 300,
    headerName: "Storage Bucket Name",
  },
  {
    field: "actions",
    headerName: "Actions",
    renderCell: ({ row }) => (
      <Button
        component={RouterLink}
        to="/servers/$serverId/tenant/$env/$id"
        params={{
          env: row.env,
          id: row.id,
        }}
        variant="contained"
        size="small"
        style={{ marginLeft: 16 }}
      >
        View
      </Button>
    ),
  },
];

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { server } = Route.useLoaderData();
  const {
    data: tenants,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useTenants(serverId);

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

            <Box sx={{ mt: 3, height: 1, width: "100%" }}>
              <DataGrid
                loading={tenantsLoading}
                rows={tenants ?? []}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 50,
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 50, 100]}
                checkboxSelection
                disableRowSelectionOnClick
                getRowId={(row) => `${row.id}-${row.env}`}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
