import { Server } from "@/api/server/server.types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useMatchRoute } from "@tanstack/react-router";
import Logo from "./Logo";
import Link from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import RouterLink from "./RouterLink";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import PendingRootMigrationsLoader from "./PendingRootMigrationsLoader";
import PendingMigrationsLoader from "./PendingMigrationsLoader";
import Button from "@mui/material/Button";
import SolarSettingsBold from "~icons/solar/settings-bold";
import { IconButton } from "@mui/material";

type Props = {
  server: Server;
};

export default function ServerToolbar({ server }: Props) {
  const serverId = server.id;

  const matchRoute = useMatchRoute();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Logo />

        <Breadcrumbs aria-label="breadcrumb" sx={{ ml: 3 }}>
          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            href="/"
          >
            Servers
          </Link>

          {matchRoute({ to: "/servers/$serverId" }) ? (
            <Typography
              sx={{
                color: "text.primary",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {server.name}{" "}
              <Box
                component="span"
                color="text.secondary"
                sx={{ fontSize: 12 }}
              >
                {server.id}
              </Box>
            </Typography>
          ) : (
            <Link
              underline="hover"
              component={RouterLink}
              to="/servers/$serverId"
              sx={{
                color: "text.primary",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {server.name}{" "}
              <Box
                component="span"
                color="text.secondary"
                sx={{ fontSize: 12 }}
              >
                {server.id}
              </Box>
            </Link>
          )}
        </Breadcrumbs>

        <Box flex="auto" />

        <Stack spacing={2} direction="row">
          {/*Only show migration actions at the root of the server*/}
          {matchRoute({ to: "/servers/$serverId" }) && (
            <>
              <PendingRootMigrationsLoader serverId={serverId} />
              <PendingMigrationsLoader serverId={serverId} />
            </>
          )}

          {!matchRoute({ to: "/servers/$serverId/edit" }) ? (
            <Button
              variant="contained"
              component={RouterLink}
              to="/servers/$serverId/edit"
              color="error"
            >
              Edit Server
            </Button>
          ) : (
            <Button
              variant="contained"
              component={RouterLink}
              to="/servers/$serverId"
            >
              Back
            </Button>
          )}

          <Button
            color="warning"
            variant="contained"
            component={RouterLink}
            to="/"
            params={{ serverId }}
          >
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
