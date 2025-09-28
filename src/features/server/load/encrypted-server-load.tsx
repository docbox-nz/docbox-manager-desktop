import { getAPIErrorMessageCode } from "@/api/axios";
import { useLoadServer } from "@/api/server/server.mutations";
import RouterLink from "@/components/RouterLink";
import { useAppForm } from "@/hooks/use-app-form";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod/v4";

type Props = {
  serverId: string;
  onSuccess: VoidFunction;
};

const formSchema = z.object({
  password: z.string().nonempty(),
});

type FormSchema = z.input<typeof formSchema>;

const defaultValues: FormSchema = {
  password: "",
};

const formOpts = formOptions({
  defaultValues,
  validators: {
    onSubmit: formSchema,
  },
});

export default function EncryptedServerLoad({ serverId, onSuccess }: Props) {
  const loadServerMutation = useLoadServer();
  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      loadServerMutation.mutate(
        {
          serverId,
          loadConfig: {
            password: value.password,
          },
        },
        {
          onSuccess: () => {
            onSuccess();
          },
        }
      );
    },
  });

  const errorCode = loadServerMutation.error
    ? getAPIErrorMessageCode(loadServerMutation.error)
    : null;

  return (
    <Container sx={{ py: 4 }} maxWidth="sm">
      <Card>
        <CardHeader
          title="Encrypted Server"
          subheader="This server config is encrypted with a password, please enter the password below"
          action={
            <Button component={RouterLink} to="/" sx={{ my: 1, mr: 1 }}>
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
                name="password"
                children={(field) => (
                  <field.TextField
                    type="password"
                    variant="outlined"
                    size="medium"
                    label="Password"
                    helperText="Enter password to decrypt server config"
                  />
                )}
              />

              {errorCode === "INCORRECT_PASSWORD" && (
                <Alert severity="error">
                  <AlertTitle>Incorrect Password</AlertTitle>
                  Check that the provided password is correct and try again
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                loading={loadServerMutation.isPending}
              >
                Decrypt
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
