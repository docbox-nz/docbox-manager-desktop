import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LoadingPage from "@/components/LoadingPage";
import { useServers } from "@/api/server/server.queries";
import { Container } from "@mui/system";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import { useLoadServer } from "@/api/server/server.mutations";
import ServerSelectItem from "@/components/server/ServerSelectItem";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import RouterLink from "@/components/RouterLink";
import ErrorPage from "@/components/ErrorPage";
import { getAPIErrorMessage } from "@/api/axios";
import ListItem from "@mui/material/ListItem";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const navigate = useNavigate();

  const serversQuery = useServers();
  const loadServerMutation = useLoadServer();

  if (serversQuery.isError) {
    return <ErrorPage error={getAPIErrorMessage(serversQuery.error)} />;
  }

  if (loadServerMutation.isError) {
    return (
      <ErrorPage error={getAPIErrorMessage(loadServerMutation.error)}>
        <Button onClick={() => loadServerMutation.reset()}>Back</Button>
      </ErrorPage>
    );
  }

  if (serversQuery.isLoading) {
    return <LoadingPage message="Loading available servers..." />;
  }

  if (loadServerMutation.isPending) {
    return <LoadingPage message="Loading server..." />;
  }

  return (
    <Container sx={{ py: 2 }}>
      <Card>
        <CardHeader
          title="Connect"
          subheader="Add or connect to your docbox server"
          action={
            <Button
              component={RouterLink}
              to="/servers/create"
              sx={{ my: 1, mr: 1 }}
            >
              Add New Server
            </Button>
          }
        />

        <CardContent>
          {serversQuery.data && (
            <List>
              {serversQuery.data.length > 0 ? (
                serversQuery.data.map((server) => (
                  <ServerSelectItem
                    key={server.id}
                    serverId={server.id}
                    name={server.name}
                    onLoad={() => {
                      loadServerMutation.mutate(
                        {
                          serverId: server.id,
                          loadConfig: {},
                        },
                        {
                          onSuccess() {
                            navigate({
                              to: "/servers/$serverId",
                              params: { serverId: server.id },
                            });
                          },
                        }
                      );
                    }}
                  />
                ))
              ) : (
                <ListItem>
                  <Typography>No servers available</Typography>
                </ListItem>
              )}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
