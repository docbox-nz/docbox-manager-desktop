import { withFieldGroup } from "@/hooks/use-app-form";
import Stack from "@mui/material/Stack";
import { useStore } from "@tanstack/react-form";
import z from "zod/v4";
import { DEFAULT_TAG } from "./tenant-section";
import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import InputAdornment from "@mui/material/InputAdornment";
import { Alert } from "@mui/material";

export const databaseSectionSchema = z.object({
  db_name: z
    .stringFormat("db-name", /^[a-z0-9_-]+$/, {
      message:
        "Database name only container lowercase letters, numbers, dashes, and underscores",
    })
    .nonempty(),
  db_secret_name: z.stringFormat("secret-name", /^[a-z0-9_-]+$/, {
    message:
      "Secret name must only container lowercase letters, numbers, dashes, and underscores",
  }),
  db_role_name: z
    .stringFormat("db-role-name", /^[a-z0-9_]+$/, {
      message:
        "Role name must only container lowercase letters, numbers, and underscores",
    })
    .nonempty(),
  db_iam_user: z.boolean(),
});

export const databaseSectionDefaultValues: z.input<
  typeof databaseSectionSchema
> = {
  db_name: DEFAULT_TAG,
  db_secret_name: DEFAULT_TAG,
  db_role_name: DEFAULT_TAG,
  db_iam_user: false,
};

export const DatabaseSection = withFieldGroup({
  props: {
    environmentTag: "tag",
  },
  defaultValues: databaseSectionDefaultValues,
  render: function Render({ group, environmentTag }) {
    const valid = useStore(
      group.store,
      (state) => databaseSectionSchema.safeParse(state.values).success,
    );

    const db_iam_user = useStore(
      group.store,
      (state) => state.values.db_iam_user,
    );

    return (
      <FormSectionAccordion title="Database" valid={valid}>
        <Stack spacing={3}>
          <group.AppField
            name="db_name"
            children={(field) => (
              <field.TextField
                variant="outlined"
                size="medium"
                label="Database Name"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">docbox-</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        -{environmentTag}
                      </InputAdornment>
                    ),
                  },
                }}
                helperText="Name of the postgres database"
              />
            )}
          />

          <group.AppField
            name="db_role_name"
            children={(field) => (
              <field.TextField
                variant="outlined"
                size="medium"
                label="Database Role Name"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">docbox_</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        _{environmentTag}_api
                      </InputAdornment>
                    ),
                  },
                }}
                helperText="Name of the role used to access"
              />
            )}
          />

          <Stack spacing={1}>
            <group.AppField
              name="db_iam_user"
              children={(field) => (
                <field.Checkbox label="Use AWS IAM signed database authentication" />
              )}
            />

            <Alert color="info">
              Database authentication will use temporary signed tokens to
              authenticate. This will only work on AWS RDS environments, ensure
              the relevant IAM policies are in-place to allow access
            </Alert>
          </Stack>

          {!db_iam_user && (
            <group.AppField
              name="db_secret_name"
              children={(field) => (
                <field.TextField
                  variant="outlined"
                  size="medium"
                  label="Database Secret Name"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          postgres/docbox/{environmentTag}/
                        </InputAdornment>
                      ),
                    },
                  }}
                  helperText="Name of the secret to store the database credentials within"
                />
              )}
            />
          )}
        </Stack>
      </FormSectionAccordion>
    );
  },
});
