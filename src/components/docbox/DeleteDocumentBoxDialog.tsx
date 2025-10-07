import { getAPIErrorMessage } from "@/api/axios";
import { useDeleteDocumentBox } from "@/api/docbox/docbox.mutations";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useForm } from "@tanstack/react-form";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import DialogActions from "@mui/material/DialogActions";
import type { DocumentBoxScope } from "@docbox-nz/docbox-sdk";
import { toast } from "sonner";
import Typography from "@mui/material/Typography";

type Props = {
  open: boolean;
  onClose: VoidFunction;
  scope: DocumentBoxScope;
};

export default function DeleteDocumentBoxDialog({
  open,
  onClose,

  scope,
}: Props) {
  const deleteDocumentBox = useDeleteDocumentBox();

  const form = useForm({
    onSubmit: async ({}) => {
      await deleteDocumentBox.mutateAsync({
        scope,
      });

      onClose();
      toast.success("Deleted document box");
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete File</DialogTitle>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Typography>
              Are you sure you want to delete the <b>&quot;{scope}&quot;</b>{" "}
              document box scope? This will permanently delete all files,
              folders, and links contained within.
            </Typography>

            {deleteDocumentBox.isError && (
              <Alert severity="error">
                Failed to delete: {getAPIErrorMessage(deleteDocumentBox.error)}
              </Alert>
            )}

            <DialogActions>
              <Button type="button" variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                loading={deleteDocumentBox.isPending}
              >
                Delete
              </Button>
            </DialogActions>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
