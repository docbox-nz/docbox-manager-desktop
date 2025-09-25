import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import RouterLink from "./RouterLink";
import Button from "@mui/material/Button";

export default function Header() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box component="img" src="/box.svg" width={32} height={32} />
        <RouterLink
          to="/"
          sx={{ color: "text.primary", textDecoration: "none", flexGrow: 1 }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              ml: 1,
              display: { xs: "none", sm: "block" },
            }}
          >
            Docbox Manager
          </Typography>
        </RouterLink>

        <Box sx={{ display: "flex" }}>
          <Button component={RouterLink} to="/" sx={{ my: 1, mr: 1 }}>
            Servers
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
