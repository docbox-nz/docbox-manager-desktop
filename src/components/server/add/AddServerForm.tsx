import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Card, { cardClasses } from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Container } from "@mui/system";
import { useState } from "react";
import LogosAwsSecretsManager from "~icons/logos/aws-secrets-manager";
import SolarLockPasswordBoldDuotone from "~icons/solar/lock-password-bold-duotone";
import SolarLockPasswordBroken from "~icons/solar/lock-password-broken";
import AddServerFormAwsSecret from "./AddServerFormAwsSecret";
import Button from "@mui/material/Button";

type Props = {
  onCancel: VoidFunction;
};

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

enum AddMode {
  AwsSecret,
  Encrypted,
  Config,
}

export default function AddServerForm({ onCancel }: Props) {
  const [addMode, setAddMode] = useState<AddMode | null>(null);

  if (addMode === AddMode.AwsSecret) {
    return <AddServerFormAwsSecret onCancel={() => setAddMode(null)} />;
  }

  return (
    <Container sx={{ py: 2 }}>
      <Typography variant="h4">Add Server</Typography>
      <Typography variant="body2">Add a new server for management</Typography>
      <Button onClick={() => onCancel()}>Back</Button>

      <Stack sx={{ my: 2 }} spacing={1}>
        <CardButton onClick={() => setAddMode(AddMode.AwsSecret)}>
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

        <CardButton>
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

          <Stack sx={{ alignItems: "flex-start", p: 2, textAlign: "left" }}>
            <Typography variant="h6">Encrypted Stored</Typography>
            <Typography variant="body2">
              Add a configuration that will be stored within docbox manager
              encrypted with a password
            </Typography>
          </Stack>
        </CardButton>

        <CardButton>
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
              component={SolarLockPasswordBroken}
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
              Stored within docbox manager. This is not encrypted and is not
              recommended for production
            </Typography>
          </Stack>
        </CardButton>
      </Stack>
    </Container>
  );
}
