import { getAPIErrorMessage } from "@/api/axios";
import { useTenantsMigrations } from "@/api/root/root.queries";
import Alert from "@mui/material/Alert";
import { Stack } from "@mui/system";
import { PendingMigrations } from "./PendingMigrations";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

type Props = {
  serverId: string;
};

export default function PendingMigrationsLoader({ serverId }: Props) {
  const { data, isLoading, error } = useTenantsMigrations(serverId);

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

  return <PendingMigrations serverId={serverId} tenants={data} />;
}
