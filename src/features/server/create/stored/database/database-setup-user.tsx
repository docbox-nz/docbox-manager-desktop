import { withFieldGroup } from "@/hooks/use-app-form";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";
import SolarInfoCircleBold from "~icons/solar/info-circle-bold";

const setupUserBaseSchema = z.object({
  use_secret: z.boolean(),
  username: z.string(),
  password: z.string(),
  secret_name: z.string(),
});

export const setupUserSchema = z.discriminatedUnion("use_secret", [
  // Setup user when using a secret
  setupUserBaseSchema.extend({
    use_secret: z.literal(true),
    secret_name: z.string().nonempty(),
  }),

  // Setup user when using provided username and password
  setupUserBaseSchema.extend({
    use_secret: z.literal(false),
    username: z.string().nonempty(),
    password: z.string().nonempty(),
  }),
]);

export const setupUserDefaultValues: z.input<typeof setupUserBaseSchema> = {
  username: "",
  password: "",
  secret_name: "postgres/docbox/master",
  use_secret: true,
};

export const DatabaseSetupUser = withFieldGroup({
  defaultValues: setupUserDefaultValues,
  render: function Render({ group }) {
    const useSecret = useStore(group.store, (group) => group.values.use_secret);

    return (
      <Stack component={Paper} elevation={4} sx={{ p: 3 }} spacing={3}>
        <Stack>
          <Typography variant="body1">Setup User</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: "sm" }}
          >
            The setup user is a privileged database user that is used for
            setting up docbox databases, running migrations, and querying
            tenants
          </Typography>
        </Stack>

        <group.AppField
          name="use_secret"
          children={(field) => (
            <field.Switch
              label="Use secrets manager"
              helperText="Load the database setup user from a secret manager secret"
            />
          )}
        />

        {useSecret ? (
          <>
            <group.AppField
              name="secret_name"
              children={(field) => (
                <field.TextField
                  required
                  variant="outlined"
                  size="medium"
                  label="Database Setup User Secret Name"
                  helperText="Secret manager secret name containing the database setup user credentials"
                />
              )}
            />

            <Alert color="info" icon={<SolarInfoCircleBold fontSize={18} />}>
              The secret stored in the secret manager must be in the following
              format:
              <pre>
                {JSON.stringify({
                  username: "username",
                  password: "password",
                })}
              </pre>
            </Alert>
          </>
        ) : (
          <>
            <group.AppField
              name="username"
              children={(field) => (
                <field.TextField
                  required
                  variant="outlined"
                  size="medium"
                  label="Username"
                  helperText="Username for the setup database user"
                />
              )}
            />

            <group.AppField
              name="password"
              children={(field) => (
                <field.TextField
                  required
                  type="password"
                  variant="outlined"
                  size="medium"
                  label="Password"
                  helperText="Password for the setup database user"
                />
              )}
            />
          </>
        )}
      </Stack>
    );
  },
});
