import { createFileRoute } from "@tanstack/react-router";
import LoadingPage from "@/components/LoadingPage";
import { Container } from "@mui/system";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ServerItem from "@/components/server/ServerItem";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import RouterLink from "@/components/RouterLink";
import ListItem from "@mui/material/ListItem";
import ErrorPage from "@/components/ErrorPage";
import { getAPIErrorMessage } from "@/api/axios";
import { getServers } from "@/api/server/server.requests";

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => {
    const servers = await getServers();
    return { servers };
  },
  pendingComponent: () => (
    <LoadingPage message="Loading available servers..." />
  ),
  errorComponent: ({ error }) => (
    <ErrorPage
      title="Failed to load available servers"
      error={getAPIErrorMessage(error)}
    />
  ),
});

function App() {
  const { servers } = Route.useLoaderData();

  return (
    <Container sx={{ py: 2 }}>
      <Card>
        <CardHeader
          title="Connect"
          subheader="Add or connect to your docbox server"
          action={
            <Button
              component={RouterLink}
              variant="contained"
              to="/servers/create"
              sx={{ my: 1, mr: 1 }}
            >
              Add New Server
            </Button>
          }
          sx={{ pb: 0, px: 4, pt: 3 }}
        />

        <CardContent sx={{ pt: 0 }}>
          <List>
            {servers.length > 0 ? (
              servers.map((server) => (
                <ServerItem
                  key={server.id}
                  serverId={server.id}
                  name={server.name}
                />
              ))
            ) : (
              <ListItem>
                <Typography>No servers available</Typography>
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
}
