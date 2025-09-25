import { getAPIErrorMessage } from "@/api/axios";
import { useTenants } from "@/api/tenant/tenant.queries";
import { Tenant } from "@/api/tenant/tenant.types";
import PendingMigrationsLoader from "@/components/PendingMigrationsLoader";
import RouterLink from "@/components/RouterLink";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId/")({
  component: RouteComponent,
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
  const {
    data: tenants,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useTenants(serverId);

  return (
    <>
      <PendingMigrationsLoader serverId={serverId} />
      <Card sx={{ m: 3 }}>
        <CardContent>
          <Stack spacing={1}>
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
              <Alert color="error">
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
                      pageSize: 5,
                    },
                  },
                }}
                pageSizeOptions={[5]}
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
