import { getAPIErrorMessage } from "@/api/axios";
import { isInitialized } from "@/api/root/root.requests";
import ErrorPage from "@/components/ErrorPage";
import LoadingPage from "@/components/LoadingPage";
import RouterLink from "@/components/RouterLink";
import { Button } from "@mui/material";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId/_initialized")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const initialized = await isInitialized(params.serverId);
    if (!initialized) {
      throw redirect({
        to: "/servers/$serverId/initialize",
        params,
      });
    }

    return {};
  },
  gcTime: 0,
  pendingMinMs: 0,
  pendingComponent: () => (
    <LoadingPage
      message="Checking server initialization state"
      content={
        <Button component={RouterLink} to="/">
          Back
        </Button>
      }
    />
  ),
  errorComponent: ({ error }) => (
    <ErrorPage error={getAPIErrorMessage(error)}>
      <Button component={RouterLink} to="/">
        Back
      </Button>
    </ErrorPage>
  ),
});

function RouteComponent() {
  const {} = Route.useLoaderData();

  return <Outlet />;
}
