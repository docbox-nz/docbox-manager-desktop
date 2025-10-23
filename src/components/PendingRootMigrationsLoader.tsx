import { getAPIErrorMessage } from "@/api/axios";
import { useRootMigrations } from "@/api/root/root.queries";
import Alert from "@mui/material/Alert";
import { Stack } from "@mui/system";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import RootMigrateButton from "./RootMigrateButton";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

type Props = {
  serverId: string;
};

export default function PendingRootMigrationsLoader({ serverId }: Props) {
  const { data, isLoading, error } = useRootMigrations(serverId);

  if (isLoading) {
    return (
      <Stack component={Paper} elevation={3} spacing={1} sx={{ m: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1, py: 1 }}
        >
          <Typography variant="h6">Pending Migrations</Typography>
        </Stack>

        <LinearProgress />
      </Stack>
    );
  }

  if (error || !data) {
    return (
      <Stack component={Paper} elevation={3} spacing={1} sx={{ m: 3 }}>
        <Alert severity="error">
          Failed to load pending migrations: {getAPIErrorMessage(error)}
        </Alert>
      </Stack>
    );
  }

  const totalMigrations = data.length;

  return (
    <Stack component={Paper} elevation={3} spacing={1} sx={{ m: 3, p: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1 }}
      >
        <Typography variant="h6">Pending Root Migrations</Typography>
      </Stack>

      {totalMigrations === 0 && (
        <Typography color="text.secondary" sx={{ px: 1 }}>
          No pending migrations, root database is up-to-date
        </Typography>
      )}

      {totalMigrations > 0 && (
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
                    <Box component="span" sx={{ fontWeight: "bold", ml: 0.5 }}>
                      {totalMigrations} pending migrations
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
  );
}
