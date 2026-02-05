import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import { withFieldGroup } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";
import {
  createSetupUserForm,
  DatabaseSetupUser,
  setupUserDefaultValues,
  setupUserSchema,
} from "./database/database-setup-user";
import {
  AdminDatabaseConfig,
  AdminDatabaseSetupUserConfig,
} from "@/api/server";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

export const databaseSectionSchema = z.object({
  // Base credentials
  host: z.string().nonempty(),
  port: z.number(),

  // Setup user
  setup_user: setupUserSchema,

  // Root secret
  root_secret_name: z.string(),

  // Whether to use IAM authentication
  root_iam: z.boolean(),
});

export const databaseSectionDefaultValues: z.input<
  typeof databaseSectionSchema
> = {
  host: "",
  port: 5432,
  setup_user: setupUserDefaultValues,
  root_secret_name: "postgres/docbox/config",
  root_iam: false,
};

export function createAdminDatabaseConfigForm(
  values: AdminDatabaseConfig,
): z.output<typeof databaseSectionSchema> {
  return {
    host: values.host,
    port: values.port,
    setup_user: createSetupUserForm(values),
    root_secret_name: values.root_secret_name ?? "",
    root_iam: values.root_iam ?? false,
  };
}

export function createAdminDatabaseConfig(
  values: z.output<typeof databaseSectionSchema>,
): AdminDatabaseConfig {
  let setup_user: AdminDatabaseSetupUserConfig | undefined;
  let setup_user_secret_name: string | undefined;

  if (values.setup_user.use_secret) {
    setup_user_secret_name = values.setup_user.secret_name;
  } else {
    setup_user = {
      username: values.setup_user.username,
      password: values.setup_user.password,
    };
  }

  return {
    host: values.host,
    port: values.port,
    root_secret_name: values.root_secret_name,
    setup_user,
    setup_user_secret_name,
    root_iam: values.root_iam,
  };
}

export const DatabaseSection = withFieldGroup({
  defaultValues: databaseSectionDefaultValues,
  render: function Render({ group }) {
    const valid = useStore(
      group.store,
      (group) => databaseSectionSchema.safeParse(group.values).success,
    );

    const root_iam = useStore(group.store, (state) => state.values.root_iam);

    return (
      <FormSectionAccordion title="Database" valid={valid}>
        <group.AppField
          name="host"
          children={(field) => (
            <field.TextField
              required
              variant="outlined"
              size="medium"
              label="Database Host"
              helperText="Host of the postgres database"
            />
          )}
        />

        <group.AppField
          name="port"
          children={(field) => (
            <field.NumberField
              required
              variant="outlined"
              size="medium"
              label="Database Port"
              helperText="Port of the postgres database"
            />
          )}
        />

        <Stack spacing={1}>
          <group.AppField
            name="root_iam"
            children={(field) => (
              <field.Checkbox label="Use AWS IAM signed database authentication for root database" />
            )}
          />

          <Alert color="info">
            Database authentication will use temporary signed tokens to
            authenticate. This will only work on AWS RDS environments, ensure
            the relevant IAM policies are in-place to allow access
          </Alert>
        </Stack>

        {!root_iam && (
          <group.AppField
            name="root_secret_name"
            children={(field) => (
              <field.TextField
                required
                variant="outlined"
                size="medium"
                label="Database Root Secret Name"
                helperText="Name of the secret manager secret that will store the root database credentials"
              />
            )}
          />
        )}

        <DatabaseSetupUser form={group} fields="setup_user" />
      </FormSectionAccordion>
    );
  },
});
