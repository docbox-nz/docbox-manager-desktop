import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LoadingPage from "@/components/LoadingPage";
import { useServers } from "@/api/server/server.queries";
import { Container, Grid } from "@mui/system";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import { useLoadServer } from "@/api/server/server.mutations";
import ServerSelectItem from "@/components/server/ServerSelectItem";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import RouterLink from "@/components/RouterLink";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const navigate = useNavigate();

  const serversQuery = useServers();
  const loadServerMutation = useLoadServer();

  if (serversQuery.isError) {
    return "Error";
  }

  if (loadServerMutation.isError) {
    return (
      <Container sx={{ py: 2 }}>
        Failed to load server
        <Button onClick={() => loadServerMutation.reset()}>Back</Button>
      </Container>
    );
  }

  if (serversQuery.isLoading || loadServerMutation.isPending) {
    return <LoadingPage />;
  }

  return (
    <Container sx={{ py: 2 }}>
      <Card>
        <CardHeader
          title="Connect"
          subheader="Add or connect to your docbox server"
        />

        <CardContent>
          <Grid container sx={{ mt: 3 }}>
            <Grid size={{ xs: 5 }}>
              <Typography textAlign="center" variant="h6" sx={{ mb: 3 }}>
                Existing Server
              </Typography>

              {serversQuery.data && (
                <>
                  {serversQuery.data.length > 0 ? (
                    <List>
                      {serversQuery.data.map((server) => (
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
                      ))}
                    </List>
                  ) : (
                    <Typography>No servers available</Typography>
                  )}
                </>
              )}
            </Grid>
            <Grid size={{ xs: 2 }}>or</Grid>
            <Grid size={{ xs: 5 }}>
              <Typography textAlign="center" variant="h6" sx={{ mb: 3 }}>
                New Server
              </Typography>

              <Button component={RouterLink} to="/servers/create">
                Add New Server
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
