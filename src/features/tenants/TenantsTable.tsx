import { Tenant } from "@/api/tenant/tenant.types";
import RouterLink from "@/components/RouterLink";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
} from "@mui/x-data-grid";
import { LinkProps } from "@tanstack/react-router";

type Props = {
  tenants: Tenant[];
  loading: boolean;
};

const columns: GridColDef<Tenant>[] = [
  {
    field: "id",
    width: 300,
    headerName: "ID",
    renderCell({ row }) {
      return (
        <Link
          component={RouterLink}
          underline="hover"
          to="/servers/$serverId/tenant/$env/$id"
          params={{
            env: row.env,
            id: row.id,
          }}
        >
          {row.id}
        </Link>
      );
    },
  },
  {
    field: "name",
    flex: 1,
    headerName: "Name",
    renderCell({ row }) {
      return (
        <Link
          component={RouterLink}
          underline="hover"
          to="/servers/$serverId/tenant/$env/$id"
          params={{
            env: row.env,
            id: row.id,
          }}
        >
          {row.name}
        </Link>
      );
    },
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
    type: "actions",
    headerName: "Actions",
    getActions: ({ row }: GridRowParams) => [
      <GridActionsCellItem
        showInMenu
        component={RouterLink}
        {...({
          // GridActionsCellItem doesn't forward props so this has to be done
          // to prevent type errors
          to: "/servers/$serverId/tenant/$env/$id",
          params: {
            env: row.env,
            id: row.id,
          },
        } satisfies LinkProps)}
        label="View"
      />,

      <GridActionsCellItem
        showInMenu
        component={RouterLink}
        {...({
          // GridActionsCellItem doesn't forward props so this has to be done
          // to prevent type errors
          to: ".",
          search: (search) => ({ ...search, deleteTenantId: row.id }),
        } satisfies LinkProps)}
        label="Delete"
      />,
    ],
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
