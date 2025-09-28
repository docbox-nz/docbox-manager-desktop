import { getAPIErrorMessage, getAPIErrorMessageCode } from "@/api/axios";
import { serverKeys } from "@/api/server/server.keys";
import { useLoadServer } from "@/api/server/server.mutations";
import {
  isServerActive,
  loadServer,
  unloadServer,
} from "@/api/server/server.requests";
import ErrorPage from "@/components/ErrorPage";
import { InitializeGuard } from "@/components/InitializeGuard";
import LoadingPage from "@/components/LoadingPage";
import EncryptedLogin from "@/features/server/load/encrypted-login";
import { queryClient } from "@/integrations/tanstack-query/root-provider";
import Button from "@mui/material/Button";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId/_loaded")({
  component: RouteComponent,
  loader: async ({ params }) => {
    if (await isServerActive(params.serverId)) {
      return true;
    }

    // Attempt to load the server
    await loadServer(params.serverId, {});
    queryClient.invalidateQueries({
      queryKey: serverKeys.server.root(params.serverId),
    });
    return false;
  },

  onLeave: ({ params }) => {
    // Unload the server when leaving the server routes
    unloadServer(params.serverId).catch(console.error);
  },
  pendingComponent: () => <LoadingPage message="Loading server..." />,
  errorComponent: function Render({ error }) {
    const { serverId } = Route.useParams();
    const router = useRouter();
    const loadServerMutation = useLoadServer();

    const currentError = loadServerMutation.error ?? error;
    const errorCode = getAPIErrorMessageCode(currentError);

    switch (errorCode) {
      // User is missing the password
      case "MISSING_PASSWORD": {
        return (
          <EncryptedLogin
            onSubmit={(password) => {
              loadServerMutation.mutate(
                {
                  serverId,
                  loadConfig: {
                    password,
                  },
                },
                {
                  onSuccess: () => {
                    // We've loaded the server and the router can retry now
                    router.invalidate();
                  },
                }
              );
            }}
          />
        );
      }

      // Incorrect password
      case "INCORRECT_PASSWORD":
        return (
          <ErrorPage error="Incorrect password">
            <Button
              onClick={() => {
                loadServerMutation.reset();
              }}
            >
              Back
            </Button>
          </ErrorPage>
        );

      // Other error
      default:
        return (
          <ErrorPage error={getAPIErrorMessage(currentError)}>
            <Button
              onClick={() => {
                router.invalidate();
              }}
            >
              Back
            </Button>
          </ErrorPage>
        );
    }
  },
});

function RouteComponent() {
  const { serverId } = Route.useParams();

  return (
    <InitializeGuard serverId={serverId}>
      <Outlet />
    </InitializeGuard>
  );
}
