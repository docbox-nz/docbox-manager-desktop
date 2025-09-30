import { getAPIErrorMessage, getAPIErrorMessageCode } from "@/api/axios";
import { serverKeys } from "@/api/server/server.keys";
import { useLoadServer } from "@/api/server/server.mutations";
import {
  getServers,
  isServerActive,
  loadServer,
  unloadServer,
} from "@/api/server/server.requests";
import ErrorPage from "@/components/ErrorPage";
import { InitializeGuard } from "@/components/InitializeGuard";
import LoadingPage from "@/components/LoadingPage";
import RouterLink from "@/components/RouterLink";
import EncryptedServerLoad from "@/features/server/load/encrypted-server-load";
import { queryClient } from "@/integrations/tanstack-query/root-provider";
import { useAwsProfileStore } from "@/stores/aws-profile-store";
import Button from "@mui/material/Button";
import {
  createFileRoute,
  notFound,
  Outlet,
  useRouter,
} from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    if (await isServerActive(params.serverId)) {
      return;
    }

    const servers = await getServers();
    const server = servers.find((server) => server.id === params.serverId);
    if (server == undefined) {
      throw notFound();
    }

    const { profile } = useAwsProfileStore.getState();

    // Attempt to load the server
    await loadServer(profile, params.serverId, {});
    queryClient.invalidateQueries({
      queryKey: serverKeys.server.root(params.serverId),
    });

    return { server };
  },

  onLeave: ({ params }) => {
    // Unload the server when leaving the server routes
    unloadServer(params.serverId).catch(console.error);
  },
  pendingMinMs: 0,
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
          <EncryptedServerLoad
            serverId={serverId}
            onSuccess={() => {
              // We've loaded the server and the router can retry now
              router.invalidate();
            }}
          />
        );
      }

      // Other error
      default:
        return (
          <ErrorPage error={getAPIErrorMessage(currentError)}>
            <Button component={RouterLink} to="/">
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
