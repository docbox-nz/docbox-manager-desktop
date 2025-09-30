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
import { useAwsProfileStore } from "@/stores/aws-profile-store";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import { getAWSProfiles } from "@/api/utils/utils.requests";
import MenuItem from "@mui/material/MenuItem";

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => {
    const servers = await getServers();
    const awsProfiles = await getAWSProfiles().catch((error) => {
      console.error("failed to load aws profiles", error);
      return [] as string[];
    });
    return { servers, awsProfiles };
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
  const { servers, awsProfiles } = Route.useLoaderData();
  const { profile, setProfile } = useAwsProfileStore();

  return (
    <Container sx={{ py: 4 }} maxWidth="md">
      <Card>
        <CardHeader
          title="Connect"
          subheader="Add or connect to your docbox server"
          action={
            <Stack direction="row" gap={2} sx={{ my: 1, mr: 1 }}>
              <Button
                component={RouterLink}
                variant="contained"
                to="/servers/create"
              >
                Add New Server
              </Button>
            </Stack>
          }
          sx={{ pb: 0, px: 4, pt: 3 }}
        />

        <CardContent>
          <Stack direction="row" gap={2} sx={{ p: 2 }}>
            <FormControl>
              <InputLabel>AWS Profile</InputLabel>
              <Select
                label="AWS Profile"
                value={profile}
                onChange={(event) => setProfile(event.target.value)}
              >
                {awsProfiles.map((profile) => (
                  <MenuItem key={profile} value={profile}>
                    {profile}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                Select the AWS profile to use when operating
              </FormHelperText>
            </FormControl>
          </Stack>

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
