import { getAPIErrorMessage } from "@/api/axios";
import { useDocumentBoxes } from "@/api/docbox/docbox.queries";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { useMemo, useState } from "react";
import DocumentBoxesTable from "./DocumentBoxesTable";
import { GridPaginationModel } from "@mui/x-data-grid";
import { useDebounced } from "@/hooks/use-debounce";
import DocumentBoxesTableFilters from "./DocumentBoxesTableFilters";
import DocumentBoxesTableActiveFilters from "./DocumentBoxesTableActiveFilters";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CreateDocumentBoxDialog from "@/components/docbox/CreateDocumentBoxDialog";
import DeleteDocumentBoxDialog from "@/components/docbox/DeleteDocumentBoxDialog";
import { AdminDocumentBoxesRequest } from "node_modules/@docbox-nz/docbox-sdk/dist/types/admin";

type Props = {
  deleteScope?: string;
  onCloseDeleteScope: VoidFunction;
};

export default function DocumentBoxesView({
  deleteScope,
  onCloseDeleteScope,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const searchQueryDebounced = useDebounced(searchQuery, 300);

  const query = useMemo(() => {
    const query: AdminDocumentBoxesRequest = {
      offset: paginationModel.page * paginationModel.pageSize,
      size: paginationModel.pageSize,
    };

    const searchQuery = searchQueryDebounced.trim();
    if (searchQuery.length > 0) {
      query.query = searchQuery;
    }

    return query;
  }, [searchQueryDebounced, paginationModel]);

  const {
    data: documentBoxes,
    isLoading: documentBoxesLoading,
    error: documentBoxesError,
  } = useDocumentBoxes(query);

  const { results, total } = useMemo(() => {
    if (documentBoxesLoading || !documentBoxes) {
      return { results: [], total: -1 };
    }

    return {
      results: documentBoxes.results,
      total: documentBoxes.total ?? -1,
    };
  }, [documentBoxes, documentBoxesLoading]);

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1, py: 2 }}
      >
        <Typography variant="h6">Document Boxes</Typography>
        <Button onClick={() => setCreateOpen(true)}>Create Box</Button>

        <CreateDocumentBoxDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      </Stack>

      {documentBoxesError && (
        <Alert severity="error">
          Failed to load tenants: {getAPIErrorMessage(documentBoxesError)}
        </Alert>
      )}

      <DocumentBoxesTableFilters
        query={searchQuery}
        setQuery={setSearchQuery}
      />

      <DocumentBoxesTableActiveFilters
        query={searchQuery}
        setQuery={setSearchQuery}
        filteredResults={total}
      />

      <DocumentBoxesTable
        documentBoxes={results}
        loading={documentBoxesLoading}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        total={total}
      />

      {deleteScope && (
        <DeleteDocumentBoxDialog
          open
          onClose={onCloseDeleteScope}
          scope={deleteScope}
        />
      )}
    </Stack>
  );
}
