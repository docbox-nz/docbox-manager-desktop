import { useVerifyServerStorage } from "@/api/server/server.mutations";
import { StorageVerifyOutcome } from "@/api/server/server.types";
import LoadingPage from "@/components/LoadingPage";
import VerificationItem from "@/components/VerificationItem";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import { createFileRoute } from "@tanstack/react-router";
import { Channel } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/servers/$serverId/verify")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();

  const verifyMutation = useVerifyServerStorage(serverId);
  const [outcome, setOutcome] = useState<StorageVerifyOutcome | null>(null);
  const [complete, setComplete] = useState<boolean>(false);

  const onVerifyBegin = useCallback(() => {
    setOutcome(null);
    setComplete(false);

    const channel = new Channel<StorageVerifyOutcome>();

    channel.onmessage = (outcome) => {
      setOutcome(outcome);
    };

    verifyMutation.mutate(
      {
        onEvent: channel,
      },
      {
        onSuccess: (outcome) => {
          setOutcome(outcome);
          setComplete(true);
        },
      }
    );
  }, [verifyMutation]);

  return (
    <Stack>
      {outcome && (
        <List>
          <VerificationItem
            name="Create Bucket"
            description="Ensures that bucket creation is possible"
            outcome={outcome.create_bucket}
            complete={complete}
          />
          <VerificationItem
            name="Upload"
            description="Ensures that uploading a file succeeds"
            outcome={outcome.upload_file}
            complete={complete}
          />
          <VerificationItem
            name="Download"
            description="Ensures that download a file succeeds"
            outcome={outcome.get_file}
            complete={complete}
          />
          <VerificationItem
            name="Delete"
            description="Ensures that deleting a file succeeds"
            outcome={outcome.delete_file}
            complete={complete}
          />
          <VerificationItem
            name="Presigned Upload"
            description="Ensures that presigned uploading a file succeeds"
            outcome={outcome.create_presigned}
            complete={complete}
          />
          <VerificationItem
            name="Presigned Download"
            description="Ensures that presigned downloading of a file succeeds"
            outcome={outcome.create_presigned_download}
            complete={complete}
          />
          <VerificationItem
            name="Delete Bucket"
            description="Ensures that deleting buckets is possible"
            outcome={outcome.create_presigned_download}
            complete={complete}
          />
        </List>
      )}

      <Button onClick={onVerifyBegin} loading={verifyMutation.isPending}>
        Verify
      </Button>
    </Stack>
  );
}
