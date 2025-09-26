import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Container } from "@mui/system";
import LogosAwsSecretsManager from "~icons/logos/aws-secrets-manager";
import SolarLockPasswordBoldDuotone from "~icons/solar/lock-password-bold-duotone";
import SolarLockPasswordBroken from "~icons/solar/lock-password-broken";
import Button from "@mui/material/Button";
import { createFileRoute } from "@tanstack/react-router";
import RouterLink from "@/components/RouterLink";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

export const Route = createFileRoute("/servers/create/")({
  component: RouteComponent,
});

const CardButton = styled(ButtonBase)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.text.primary,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: theme.spacing(1),
  border: "none",
}));

function RouteComponent() {
  return (
    <Container sx={{ py: 2 }}>
      <Card>
        <CardHeader
          title="Add Server"
          subheader="Add a new server for management"
          action={
            <Button component={RouterLink} to="/" sx={{ my: 1, mr: 1 }}>
              Back
            </Button>
          }
        />
        <CardContent>
          <Stack sx={{ my: 2 }} spacing={1}>
            <CardButton component={RouterLink} to="/servers/create/aws-secret">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Box
                  component={LogosAwsSecretsManager}
                  sx={{ width: 80, height: 80 }}
                />
              </Box>

              <Stack sx={{ alignItems: "flex-start", p: 2, textAlign: "left" }}>
                <Typography variant="h6">AWS Secret Manager</Typography>
                <Typography variant="body2">
                  Add a configuration that is stored within AWS secrets manager
                </Typography>
              </Stack>
            </CardButton>

            <CardButton component={RouterLink} to="/servers/create/stored">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Box
                  component={SolarLockPasswordBoldDuotone}
                  sx={{ width: 60, height: 60 }}
                />
              </Box>

              <Stack
                sx={{
                  alignItems: "flex-start",
                  p: 2,
                  textAlign: "left",
                }}
              >
                <Typography variant="h6">Stored</Typography>
                <Typography variant="body2">
                  Create an optionally encrypted secret stored within docbox
                  manager
                </Typography>
              </Stack>
            </CardButton>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
