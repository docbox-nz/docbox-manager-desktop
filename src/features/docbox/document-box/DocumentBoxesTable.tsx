import Button from "@mui/material/Button";
import type { DocumentBox } from "@docbox-nz/docbox-sdk";
import {
  DataGrid,
  GridPaginationModel,
  type GridColDef,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import RouterLink from "@/components/RouterLink";

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
  },
  {
    field: "created_at",
    minWidth: 220,
    headerName: "Created At",
  },

  {
    field: "actions",
    headerName: "Actions",
    renderCell: ({ row }) => (
      <Button
        component={RouterLink}
        to="."
        search={(search: object) => ({ ...search, scope: row.scope })}
        variant="contained"
        size="small"
        style={{ marginLeft: 16 }}
      >
        View
      </Button>
    ),
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
