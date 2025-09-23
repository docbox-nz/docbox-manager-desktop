import { getAPIErrorMessage } from "@/api/axios";
import { useMigrateTenant } from "@/api/tenant/tenant.mutations";
import Button from "@mui/material/Button";
import { toast } from "sonner";

type Props = {
  serverId: string;
  id: string;
  env: string;
};

export default function TenantMigrateButton({ serverId, id, env }: Props) {
  const { isPending, mutate } = useMigrateTenant(serverId);

  return (
    <Button
      variant="contained"
      loading={isPending}
      onClick={() => {
        mutate(
          { env, tenant_id: id },
          {
            onSuccess() {
              toast.success("Migration success");
            },
            onError(error) {
              console.error(error);
              toast.error(
                `Failed to migrate tenant: ${getAPIErrorMessage(error)}`
              );
            },
          }
        );
      }}
    >
      Migrate
    </Button>
  );
}
