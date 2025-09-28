import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LoadingPage from "@/components/LoadingPage";
import { useServers } from "@/api/server/server.queries";
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

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const navigate = useNavigate();

  const serversQuery = useServers();
  if (serversQuery.isLoading) {
    return <LoadingPage message="Loading available servers..." />;
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
                  <ServerItem
                    key={server.id}
                    serverId={server.id}
                    name={server.name}
                    onLoad={() => {
                      navigate({
                        to: "/servers/$serverId",
                        params: { serverId: server.id },
                      });
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
