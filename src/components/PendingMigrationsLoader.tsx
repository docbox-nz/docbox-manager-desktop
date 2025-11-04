import { getAPIErrorMessage } from "@/api/axios";
import { useTenantsMigrations } from "@/api/root/root.queries";
import Alert from "@mui/material/Alert";
import { Stack } from "@mui/system";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import { TenantWithMigrations } from "@/api/root/root.types";
import TenantsMigrateButton from "./TenantsMigrateButton";
import Card from "@mui/material/Card";
import TenantMigrateButton from "./TenantMigrateButton";
import DialogTitle from "@mui/material/DialogTitle";
import Badge from "@mui/material/Badge";
import DialogActions from "@mui/material/DialogActions";

type Props = {
  serverId: string;
};

export default function PendingMigrationsLoader({ serverId }: Props) {
  const { data, isLoading, error } = useTenantsMigrations(serverId);
  const [open, setOpen] = useState(false);

  const tenants = useMemo(() => data ?? [], [data]);

  const totalMigrations = useMemo(() => {
    let totalMigrations = 0;

    for (const tenant of tenants) {
      totalMigrations += tenant.migrations.length;
    }

    return totalMigrations;
  }, [tenants]);

  const environments = useMemo(() => {
    const envs = new Map<string, TenantWithMigrations[]>();

    for (const tenant of tenants) {
      if (tenant.migrations.length < 1) {
        continue;
      }

      if (!envs.has(tenant.tenant.env)) {
        envs.set(tenant.tenant.env, []);
      }

      envs.get(tenant.tenant.env)!.push(tenant);
    }

    return [...envs.entries()].map(([env, tenants]) => ({
      env,
      tenants,
    }));
  }, [tenants]);

  return (
    <>
      <Badge badgeContent={totalMigrations} color="success">
        <Button
          variant="outlined"
          loading={isLoading}
          loadingPosition="start"
          onClick={() => setOpen(true)}
        >
          Tenant Migrations
        </Button>
      </Badge>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Pending Migrations</DialogTitle>

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
            {totalMigrations === 0 && (
              <Typography color="text.secondary" sx={{ px: 1 }}>
                No pending migrations, all tenants are up-to-date
              </Typography>
            )}

            {totalMigrations > 0 && (
              <Stack spacing={2} alignItems="flex-start" sx={{ mt: 2 }}>
                <TenantsMigrateButton serverId={serverId} />

                <Stack sx={{ px: 1, py: 1, width: 1 }} spacing={2}>
                  {environments.map(({ env, tenants }) => (
                    <Stack key={env} spacing={2}>
                      <Typography variant="subtitle2">{env}</Typography>

                      {tenants.map(({ tenant, migrations }) => (
                        <Card variant="outlined" sx={{ p: 2 }} key={tenant.id}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Typography>{tenant.id}</Typography>
                            <Typography flex="auto">{tenant.name}</Typography>
                            <Typography>Pending {migrations.length}</Typography>
                            <TenantMigrateButton
                              serverId={serverId}
                              id={tenant.id}
                              env={tenant.env}
                            />
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  ))}
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
