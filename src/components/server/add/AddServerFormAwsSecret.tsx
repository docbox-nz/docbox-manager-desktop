import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Alert from "@mui/material/Alert";
import { getAPIErrorMessage } from "@/api/axios";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { FormTextField } from "@/components/form/FormTextField";
import { useCreateServer } from "@/api/server/server.mutations";

import { v4 } from "uuid";
import { ServerConfigType } from "@/api/server";

type Props = {
  onCancel: VoidFunction;
};

export default function AddServerFormAwsSecret({ onCancel }: Props) {
  const createServerMutation = useCreateServer();

  const form = useForm({
    defaultValues: {
      name: "",
      secret_name: "",
    },
    validators: {
      onChange: z.object({
        name: z.string().nonempty(),
        secret_name: z.string().nonempty(),
      }),
    },
    onSubmit: async ({ value }) => {
      await createServerMutation.mutateAsync({
        id: v4(),
        name: value.name,
        config: {
          type: ServerConfigType.AwsSecret,
          secret_name: value.secret_name,
        },
        order: 0,
      });
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Card sx={{ maxWidth: 500, width: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ width: 1, px: 2, py: 3 }}
        >
          <Box component="img" src="/box.svg" width={32} height={32} />
          <Typography variant="h6">Docbox Manager</Typography>
        </Stack>

        <Divider />

        <CardHeader
          title="AWS Secret Manager"
          subheader="Enter the secret that contains the server configuration"
          slotProps={{
            subheader: {
              mt: 1,
            },
          }}
        />
        <CardContent sx={{ py: 0 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <Stack spacing={3}>
              <form.Field
                name="name"
                children={(field) => (
                  <FormTextField
                    field={field}
                    variant="outlined"
                    size="medium"
                    label="Server Name"
                    helperText="Name the docbox server"
                  />
                )}
              />

              <form.Field
                name="secret_name"
                children={(field) => (
                  <FormTextField
                    field={field}
                    variant="outlined"
                    size="medium"
                    label="Secret Name"
                    helperText="Name of the secret within AWS secret manager that contains the config data"
                  />
                )}
              />

              {createServerMutation.isError && (
                <Alert color="error">
                  Failed to create:{" "}
                  {getAPIErrorMessage(createServerMutation.error)}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                loading={createServerMutation.isPending}
              >
                Create
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
