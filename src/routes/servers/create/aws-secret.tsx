import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { z } from "zod";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Alert from "@mui/material/Alert";
import { getAPIErrorMessage } from "@/api/axios";
import { useCreateServer } from "@/api/server/server.mutations";

import { v4 } from "uuid";
import { ServerConfigType } from "@/api/server";
import RouterLink from "@/components/RouterLink";
import Container from "@mui/material/Container";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/use-app-form";

export const Route = createFileRoute("/servers/create/aws-secret")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createServerMutation = useCreateServer();

  const form = useAppForm({
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
    onSubmit: async ({ value, formApi }) => {
      await createServerMutation.mutateAsync({
        id: v4(),
        name: value.name,
        config: {
          type: ServerConfigType.AwsSecret,
          secret_name: value.secret_name,
        },
        order: 0,
      });

      toast.success("Added new server!");
      navigate({ to: "/" });
      formApi.reset();
    },
  });

  return (
    <Container sx={{ py: 2 }}>
      <Card>
        <CardHeader
          title="AWS Secret Manager"
          subheader="Enter the secret that contains the server configuration"
          action={
            <Button
              component={RouterLink}
              to="/servers/create"
              sx={{ my: 1, mr: 1 }}
            >
              Back
            </Button>
          }
        />
        <CardContent sx={{ py: 0 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <Stack spacing={3}>
              <form.AppField
                name="name"
                children={(field) => (
                  <field.TextField
                    variant="outlined"
                    size="medium"
                    label="Server Name"
                    helperText="Name the docbox server"
                  />
                )}
              />

              <form.AppField
                name="secret_name"
                children={(field) => (
                  <field.TextField
                    variant="outlined"
                    size="medium"
                    label="Secret Name"
                    helperText="Name of the secret within AWS secret manager that contains the config data"
                  />
                )}
              />

              {createServerMutation.isError && (
                <Alert severity="error">
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
    </Container>
  );
}
