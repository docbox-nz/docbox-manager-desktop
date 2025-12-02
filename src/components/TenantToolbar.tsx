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
import Chip from "@mui/material/Chip";

type Props = {
  server: Server;
  tenant: Tenant;
};

export default function TenantToolbar({ server, tenant }: Props) {
  const serverId = server.id;

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

          <Stack direction="row" alignItems="center">
            <Typography
              sx={{
                color: "text.primary",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tenant.name}{" "}
              <Box
                component="span"
                color="text.secondary"
                sx={{ fontSize: 12 }}
              >
                {tenant.id}
              </Box>{" "}
            </Typography>
            <Chip label={tenant.env} sx={{ ml: 1 }} />
          </Stack>
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
