import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function Header() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box component="img" src="/box.svg" width={32} height={32} />
        <Typography
          variant="h6"
          component="div"
          sx={{ ml: 1, flexGrow: 1, display: { xs: "none", sm: "block" } }}
        >
          Docbox Manager
        </Typography>
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
