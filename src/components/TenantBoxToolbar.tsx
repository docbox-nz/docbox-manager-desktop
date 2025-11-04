import { Server } from "@/api/server/server.types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Logo from "./Logo";
import Link from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import RouterLink from "./RouterLink";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Tenant } from "@/api/tenant/tenant.types";

type Props = {
  server: Server;
  tenant: Tenant;
  scope: string;
};

export default function TenantBoxToolbar({ server, tenant, scope }: Props) {
  const serverId = server.id;

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Logo />

        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            href="/"
          >
            Servers
          </Link>

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
            {server.name}
          </Link>

          <Link
            underline="hover"
            component={RouterLink}
            to="/servers/$serverId/tenant/$env/$id"
            sx={{
              color: "text.primary",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tenant.name}
          </Link>

          <Typography
            sx={{
              color: "text.primary",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {scope}
          </Typography>
        </Breadcrumbs>

        <Box flex="auto" />

        <Stack spacing={2} direction="row">
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
