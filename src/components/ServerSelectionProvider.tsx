import { ServerContext } from "@/context/server-context";
import { PropsWithChildren, useState } from "react";
import LoadingPage from "./LoadingPage";
import { useServers } from "@/api/server/server.queries";
import { Container, Grid, Stack } from "@mui/system";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import AddServerForm from "@/components/server/add/AddServerForm";
import Box from "@mui/material/Box";
import { Server } from "@/api/server/server.types";
import { useLoadServer } from "@/api/server/server.mutations";

type Props = PropsWithChildren<{}>;

export default function ServerSelectionProvider({ children }: Props) {
  const serversQuery = useServers();
  const loadServerMutation = useLoadServer();

  const [isAdding, setAdding] = useState(false);
  const [server, setServer] = useState<Server | null>(null);

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

  if (isAdding) {
    return <AddServerForm onCancel={() => setAdding(false)} />;
  }

  if (server === null) {
    return (
      <Container sx={{ py: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ width: 1, px: 2, py: 3 }}
        >
          <Box component="img" src="/box.svg" width={32} height={32} />
          <Typography variant="h6">Docbox Manager</Typography>
        </Stack>

        <Typography variant="h4">Connect Server</Typography>
        <Typography variant="body2">
          Add or connect to your docbox server
        </Typography>

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
                      <ListItem key={server.id}>
                        <ListItemText
                          primary={server.name}
                          secondary={server.id}
                        />

                        <ListItemButton
                          onClick={() => {
                            loadServerMutation.mutate(
                              {
                                serverId: server.id,
                                loadConfig: {},
                              },
                              {
                                onSuccess() {
                                  setServer(server);
                                },
                              }
                            );
                          }}
                        >
                          Open
                        </ListItemButton>
                      </ListItem>
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

            <Button onClick={() => setAdding(true)}>Add New Server</Button>
          </Grid>
        </Grid>
      </Container>
    );
  }
  console.log("load");

  return (
    <ServerContext.Provider value={server}>{children}</ServerContext.Provider>
  );
}
