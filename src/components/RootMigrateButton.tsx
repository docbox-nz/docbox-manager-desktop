import { getAPIErrorMessage } from "@/api/axios";
import { useMigrateRoot } from "@/api/root/root.mutations";
import Button from "@mui/material/Button";
import { toast } from "sonner";

type Props = {
  serverId: string;
};

export default function RootMigrateButton({ serverId }: Props) {
  const { isPending, mutate } = useMigrateRoot(serverId);

  return (
    <Button
      variant="contained"
      loading={isPending}
      onClick={() => {
        mutate(undefined, {
          onSuccess() {
            toast.success("Migration success");
          },
          onError(error) {
            console.error(error);
            toast.error(`Failed to migrate root: ${getAPIErrorMessage(error)}`);
          },
        });
      }}
    >
      Apply Migrations
    </Button>
  );
}
