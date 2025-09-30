import { useDeleteServer } from "@/api/server/server.mutations";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useRouter } from "@tanstack/react-router";

type Props = {
  open: boolean;
  onClose: VoidFunction;

  serverId: string;
  serverName: string;
};

export function ConfirmDeleteServerItem({
  open,
  onClose,
  serverId,
  serverName,
}: Props) {
  const { mutate: deleteServer, isPending: isDeleting } =
    useDeleteServer(serverId);

  const router = useRouter();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the
          <b> "{serverName}" </b>
          server
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 2, px: 2 }}>
        <Button
          variant="contained"
          color="error"
          loading={isDeleting}
          onClick={() =>
            deleteServer(undefined, {
              onSuccess: () => {
                router.invalidate();
              },
            })
          }
        >
          Confirm
        </Button>
        <Button variant="outlined" disabled={isDeleting} onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
