import { getAPIErrorMessage, getAPIErrorMessageCode } from "@/api/axios";
import LoadingPage from "./LoadingPage";
import Button from "@mui/material/Button";
import ErrorPage from "./ErrorPage";
import EncryptedLogin from "@/features/server/load/encrypted-login";
import { useEffect, useMemo } from "react";
import { useServerActive, useServers } from "@/api/server/server.queries";
import { useLoadServer } from "@/api/server/server.mutations";

type Props = {
  serverId: string;
  children?: React.ReactNode;
};

export default function LoadServerGuard({ serverId, children }: Props) {
  const serversQuery = useServers();
  const serverActiveQuery = useServerActive(serverId);
  const loadServerMutation = useLoadServer();

  const activeServer = useMemo(
    () => serversQuery.data?.find((server) => server.id === serverId),
    [serverId, serversQuery.data]
  );

  useEffect(() => {
    // Nothing to load
    if (!activeServer) return;

    // Server already loaded or state still loading
    if (serverActiveQuery.data === undefined || serverActiveQuery.data === true)
      return;

    // Already trying to load
    if (loadServerMutation.isPending) return;

    console.log("Attempting to load");
    loadServerMutation.mutate({
      serverId: activeServer.id,
      loadConfig: {},
    });
  }, [loadServerMutation, serverActiveQuery, activeServer]);

  // Loading servers
  if (serverActiveQuery.isLoading) {
    return <LoadingPage message="Loading available servers..." />;
  }

  // Failed to load servers
  if (serversQuery.isError) {
    return <ErrorPage error={getAPIErrorMessage(serversQuery.error)} />;
  }

  if (activeServer === undefined) {
    return (
      <ErrorPage
        title="Server not found"
        error="Unable to find the requested server"
      />
    );
  }

  // Loading active state
  if (serverActiveQuery.isLoading) {
    return <LoadingPage message="Checking server state..." />;
  }

  // Failed to get active state
  if (serverActiveQuery.isError) {
    return <ErrorPage error={getAPIErrorMessage(serverActiveQuery.error)} />;
  }

  if (loadServerMutation.isError) {
    const errorCode = getAPIErrorMessageCode(loadServerMutation.error);
    switch (errorCode) {
      case "MISSING_PASSWORD": {
        return (
          <EncryptedLogin
            onSubmit={(password) => {
              loadServerMutation.mutate({
                serverId,
                loadConfig: {
                  password,
                },
              });
            }}
          />
        );
      }

      case "INCORRECT_PASSWORD":
        return (
          <ErrorPage error="Incorrect password">
            <Button onClick={() => loadServerMutation.reset()}>Back</Button>
          </ErrorPage>
        );

      default:
        return (
          <ErrorPage error={getAPIErrorMessage(loadServerMutation.error)}>
            <Button onClick={() => loadServerMutation.reset()}>Back</Button>
          </ErrorPage>
        );
    }
  }

  // Server is good to go, show the underlying page
  if (serverActiveQuery.data) {
    return children;
  }

  return <LoadingPage message="Loading server..." />;
}
