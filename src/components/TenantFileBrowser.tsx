import { useDocumentBox, useFolder } from "@/api/docbox/docbox.queries";
import {
  DocboxItemType,
  type DocboxItem,
  type DocFolder,
  type ResolvedFolder,
} from "@docbox-nz/docbox-sdk";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useMemo, useState } from "react";
import UploadFileDialog from "./docbox/UploadFileDialog";
import LinearProgress from "@mui/material/LinearProgress";
import DocboxItemsTable from "./docbox/DocboxItemsTable";
import IconButton from "@mui/material/IconButton";
import MdiChevronLeft from "~icons/mdi/chevron-left";
import CreateFolderDialog from "./docbox/CreateFolderDialog";
import Alert from "@mui/material/Alert";
import { getAPIErrorMessage } from "@/api/axios";
import RouterLink from "./RouterLink";
import { isNil } from "@/utils/nullable";
import CreateLinkDialog from "./docbox/CreateLinkDialog";
import EditFolderDialog from "./docbox/EditFolderDialog";
import EditLinkDialog from "./docbox/EditLinkDialog";
import EditFileDialog from "./docbox/EditFileDialog";
import DeleteFolderDialog from "./docbox/DeleteFolderDialog";
import DeleteLinkDialog from "./docbox/DeleteLinkDialog";
import DeleteFileDialog from "./docbox/DeleteFileDialog";
import FilePreviewDialog from "./docbox/FilePreviewDialog";
import DocboxFolderBreadcrumbs from "@/features/docbox/items/DocboxFolderBreadcrumbs";
import DocumentBoxStats from "@/features/docbox/document-box/DocumentBoxStats";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

type Props = {
  scope: string;
  folder_id?: string;
  preview_id?: string;
  edit_id?: string;
  delete_id?: string;

  onClosePreview: VoidFunction;
  onCloseEdit: VoidFunction;
  onCloseDelete: VoidFunction;
};

type ActiveFolder = { folder: DocFolder; children: ResolvedFolder };

export default function TenantFileBrowser({
  scope,
  folder_id,
  preview_id,
  edit_id,
  delete_id,

  onClosePreview,
  onCloseEdit,
  onCloseDelete,
}: Props) {
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createLinkOpen, setCreateLinkOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const {
    data: documentBox,
    error: documentBoxError,
    isLoading: documentBoxLoading,
  } = useDocumentBox(scope);

  const {
    data: folder,
    error: folderError,
    isLoading: folderLoading,
  } = useFolder(scope, folder_id);

  const activeFolder: ActiveFolder | undefined = useMemo(() => {
    if (folderLoading || folderError || (!folder && !isNil(folder_id))) {
      return undefined;
    }

    if (folder) {
      return { folder: folder.folder, children: folder.children };
    }

    if (documentBoxLoading || documentBoxError || !documentBox)
      return undefined;

    return { folder: documentBox.root, children: documentBox.children };
  }, [documentBox, folder]);

  const items: DocboxItem[] = useMemo(() => {
    const folder = activeFolder?.children;
    if (folder === undefined) return [];

    return [
      ...folder.folders.map(
        (folder) =>
          ({
            type: DocboxItemType.Folder,
            ...folder,
          }) satisfies DocboxItem,
      ),
      ...folder.files.map(
        (file) => ({ type: DocboxItemType.File, ...file }) satisfies DocboxItem,
      ),
      ...folder.links.map(
        (link) => ({ type: DocboxItemType.Link, ...link }) satisfies DocboxItem,
      ),
    ];
  }, [activeFolder]);

  const previewItem: DocboxItem | undefined = useMemo(() => {
    return items.find((item) => item.id === preview_id);
  }, [items, preview_id]);

  const editItem: DocboxItem | undefined = useMemo(() => {
    return items.find((item) => item.id === edit_id);
  }, [items, edit_id]);

  const deleteItem: DocboxItem | undefined = useMemo(() => {
    return items.find((item) => item.id === delete_id);
  }, [items, delete_id]);

  return (
    <>
      <Box sx={{ pt: 2 }}>
        <DocumentBoxStats scope={scope} />
      </Box>

      <Divider sx={{ mt: 2 }} />

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1, pb: 2, pt: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {activeFolder &&
            documentBox &&
            activeFolder.folder.id !== documentBox.root.id && (
              <IconButton
                size="small"
                component={RouterLink}
                to="."
                search={(search) => {
                  // Back out of the current nested directory
                  return {
                    ...search,
                    folder: activeFolder.folder.folder_id ?? undefined,
                  };
                }}
              >
                <MdiChevronLeft />
              </IconButton>
            )}

          <DocboxFolderBreadcrumbs
            scope={scope}
            activeFolder={activeFolder?.folder}
            path={activeFolder?.children?.path}
          />
        </Stack>

        {activeFolder && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => setCreateFolderOpen(true)}
            >
              Create Folder
            </Button>

            <Button variant="outlined" onClick={() => setCreateLinkOpen(true)}>
              Create Link
            </Button>

            <Button variant="outlined" onClick={() => setUploadOpen(true)}>
              Upload File
            </Button>

            <UploadFileDialog
              open={uploadOpen}
              onClose={() => setUploadOpen(false)}
              folder_id={activeFolder.folder.id}
              scope={scope}
            />

            <CreateFolderDialog
              open={createFolderOpen}
              onClose={() => setCreateFolderOpen(false)}
              folder_id={activeFolder.folder.id}
              scope={scope}
            />

            <CreateLinkDialog
              open={createLinkOpen}
              onClose={() => setCreateLinkOpen(false)}
              folder_id={activeFolder.folder.id}
              scope={scope}
            />

            {editItem && (
              <>
                {editItem.type === DocboxItemType.Folder && (
                  <EditFolderDialog
                    open
                    onClose={onCloseEdit}
                    folder={editItem}
                    scope={scope}
                  />
                )}

                {editItem.type === DocboxItemType.Link && (
                  <EditLinkDialog
                    open
                    onClose={onCloseEdit}
                    link={editItem}
                    scope={scope}
                  />
                )}

                {editItem.type === DocboxItemType.File && (
                  <EditFileDialog
                    open
                    onClose={onCloseEdit}
                    file={editItem}
                    scope={scope}
                  />
                )}
              </>
            )}

            {deleteItem && (
              <>
                {deleteItem.type === DocboxItemType.Folder && (
                  <DeleteFolderDialog
                    open
                    onClose={onCloseDelete}
                    folder={deleteItem}
                    scope={scope}
                  />
                )}

                {deleteItem.type === DocboxItemType.Link && (
                  <DeleteLinkDialog
                    open
                    onClose={onCloseDelete}
                    link={deleteItem}
                    scope={scope}
                  />
                )}

                {deleteItem.type === DocboxItemType.File && (
                  <DeleteFileDialog
                    open
                    onClose={onCloseDelete}
                    file={deleteItem}
                    scope={scope}
                  />
                )}
              </>
            )}

            {previewItem && previewItem.type === DocboxItemType.File && (
              <FilePreviewDialog
                open
                onClose={onClosePreview}
                file={previewItem}
                scope={scope}
              />
            )}
          </Stack>
        )}
      </Stack>

      {documentBoxError && (
        <Alert severity="error">
          Failed to load: {getAPIErrorMessage(documentBoxError)}
        </Alert>
      )}

      {folderError && (
        <Alert severity="error">
          Failed to load: {getAPIErrorMessage(folderError)}
        </Alert>
      )}

      {documentBoxLoading || (folderLoading && <LinearProgress />)}
      {activeFolder && <DocboxItemsTable items={items} scope={scope} />}
    </>
  );
}
