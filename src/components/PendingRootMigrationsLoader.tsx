import { getAPIErrorMessage } from "@/api/axios";
import { useRootMigrations } from "@/api/root/root.queries";
import Alert from "@mui/material/Alert";
import { Stack } from "@mui/system";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import RootMigrateButton from "./RootMigrateButton";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { useState } from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Badge from "@mui/material/Badge";
import DialogActions from "@mui/material/DialogActions";

type Props = {
  serverId: string;
};

export default function PendingRootMigrationsLoader({ serverId }: Props) {
  const { data, isLoading, error } = useRootMigrations(serverId);
  const [open, setOpen] = useState(false);

  const totalMigrations = data?.length ?? 0;

  return (
    <>
      <Badge badgeContent={totalMigrations} color="success">
        <Button
          variant="outlined"
          loading={isLoading}
          loadingPosition="start"
          onClick={() => setOpen(true)}
        >
          Root Migrations
        </Button>
      </Badge>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Pending Root Migrations</DialogTitle>

        {isLoading && <LinearProgress />}

        {error && (
          <Stack spacing={1} sx={{ m: 3 }}>
            <Alert severity="error">
              Failed to load pending migrations: {getAPIErrorMessage(error)}
            </Alert>
          </Stack>
        )}

        {data && (
          <Stack spacing={1} sx={{ m: 3, p: 2 }}>
            {data.length === 0 && (
              <Typography color="text.secondary" sx={{ px: 1 }}>
                No pending migrations, root database is up-to-date
              </Typography>
            )}

            {data.length > 0 && (
              <Stack spacing={2} alignItems="flex-start" sx={{ mt: 2 }}>
                <Stack sx={{ px: 1, py: 1, width: 1 }} spacing={2}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2">
                        Root Database Migration
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        The root database has
                        <Tooltip title={data.join(", ")}>
                          <Box
                            component="span"
                            sx={{ fontWeight: "bold", ml: 0.5 }}
                          >
                            {data.length} pending migrations
                          </Box>
                        </Tooltip>
                      </Typography>

                      <Box>
                        <RootMigrateButton serverId={serverId} />
                      </Box>
                    </Stack>
                  </Card>
                </Stack>
              </Stack>
            )}
          </Stack>
        )}

        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
