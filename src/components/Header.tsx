import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import RouterLink from "./RouterLink";

export default function Header() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box component="img" src="/box.svg" width={32} height={32} />
        <RouterLink
          to="/"
          sx={{ color: "text.primary", textDecoration: "none" }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              ml: 1,
              flexGrow: 1,
              display: { xs: "none", sm: "block" },
            }}
          >
            Docbox Manager
          </Typography>
        </RouterLink>
        <Box sx={{ display: "flex" }}>
          {/* TODO: CLEAR SERVER AND CLOSE SERVER <Button
            onClick={() => logoutMutation.mutate()}
            loading={logoutMutation.isPending}
          >
            Logout
          </Button> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
