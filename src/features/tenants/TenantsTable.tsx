import { Tenant } from "@/api/tenant/tenant.types";
import RouterLink from "@/components/RouterLink";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type Props = {
  tenants: Tenant[];
  loading: boolean;
};

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

export default function TenantsTable({ tenants, loading }: Props) {
  return (
    <Box sx={{ mt: 3, height: 1, width: 1 }}>
      <DataGrid
        loading={loading}
        rows={tenants}
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
  );
}
