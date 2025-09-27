import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import { withFieldGroup } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";
import {
  DatabaseSetupUser,
  setupUserDefaultValues,
  setupUserSchema,
} from "./database/database-setup-user";

export const databaseSectionSchema = z.object({
  // Base credentials
  host: z.string().nonempty(),
  port: z.number(),

  // Setup user
  setup_user: setupUserSchema,

  // Root secret
  root_secret_name: z.string().nonempty(),
});

export const databaseSectionDefaultValues: z.input<
  typeof databaseSectionSchema
> = {
  host: "",
  port: 5432,
  setup_user: setupUserDefaultValues,
  root_secret_name: "postgres/docbox/config",
};

export const DatabaseSection = withFieldGroup({
  defaultValues: databaseSectionDefaultValues,
  render: function Render({ group }) {
    const valid = useStore(
      group.store,
      (group) => databaseSectionSchema.safeParse(group.values).success
    );

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
            <field.TextField
              required
              type="number"
              variant="outlined"
              size="medium"
              label="Database Port"
              helperText="Port of the postgres database"
            />
          )}
        />

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

        <DatabaseSetupUser form={group} fields="setup_user" />
      </FormSectionAccordion>
    );
  },
});
