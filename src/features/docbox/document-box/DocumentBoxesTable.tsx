import type { DocumentBox } from "@docbox-nz/docbox-sdk";
import {
  DataGrid,
  GridActionsCellItem,
  GridPaginationModel,
  GridRowParams,
  type GridColDef,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import RouterLink from "@/components/RouterLink";
import Link from "@mui/material/Link";
import { LinkProps } from "@tanstack/react-router";

type Props = {
  documentBoxes: DocumentBox[];
  loading: boolean;
  total: number;

  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
};

const columns: GridColDef<DocumentBox>[] = [
  {
    field: "scope",
    flex: 1,
    headerName: "Scope",
    renderCell({ row }) {
      return (
        <Link
          component={RouterLink}
          underline="hover"
          to="/servers/$serverId/tenant/$env/$id/$scope"
          params={{ scope: row.scope }}
        >
          {row.scope}
        </Link>
      );
    },
  },
  {
    field: "created_at",
    minWidth: 220,
    headerName: "Created At",
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
          to: "/servers/$serverId/tenant/$env/$id/$scope",
          params: { scope: row.scope },
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
          search: (search) => ({ ...search, deleteScope: row.scope }),
        } satisfies LinkProps)}
        label="Delete"
      />,
    ],
  },
];

const getRowId = (box: DocumentBox) => box.scope;

export default function DocumentBoxesTable({
  documentBoxes,
  loading,
  total,
  paginationModel,
  setPaginationModel,
}: Props) {
  return (
    <Box sx={{ mt: 3, height: 1, width: "100%" }}>
      <DataGrid
        getRowId={getRowId}
        loading={loading}
        rows={documentBoxes}
        columns={columns}
        paginationMode="server"
        paginationModel={paginationModel}
        rowCount={total}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
