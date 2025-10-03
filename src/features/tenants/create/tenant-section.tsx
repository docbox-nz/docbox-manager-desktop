import { withFieldGroup } from "@/hooks/use-app-form";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { useStore } from "@tanstack/react-form";
import { v4 } from "uuid";
import z from "zod/v4";

export const DEFAULT_NAME = "Test";
export const DEFAULT_TAG = "test";

const tagSchema = z
  .string()
  .nonempty("Tag must not be empty")
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message:
      "Only alphanumeric characters, underscores, and dashes are allowed",
  });

const tenantSchemaBase = z.object({
  id: z.uuidv4(),
  name: z.string().nonempty(),
  env: z.string().nonempty(),
  simplified: z.boolean(),
  tag: z.string(),
});

export const tenantSectionSchema = z.discriminatedUnion("simplified", [
  tenantSchemaBase.extend({
    simplified: z.literal(true),
    tag: tagSchema,
  }),
  tenantSchemaBase.extend({
    simplified: z.literal(false),
  }),
]);

export const tenantSectionDefaultValues: z.input<typeof tenantSchemaBase> = {
  id: v4(),
  name: DEFAULT_NAME,
  env: "Production",
  simplified: true,
  tag: DEFAULT_TAG,
};

export const TenantSection = withFieldGroup({
  defaultValues: tenantSectionDefaultValues,
  render: function Render({ group }) {
    const simplified = useStore(
      group.store,
      (state) => state.values.simplified
    );

    return (
      <Card elevation={2}>
        <CardContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <group.AppField
              name="id"
              children={(field) => (
                <field.TextField
                  variant="outlined"
                  size="medium"
                  label="ID"
                  required
                />
              )}
            />

            <group.AppField
              name="name"
              children={(field) => (
                <field.TextField
                  variant="outlined"
                  size="medium"
                  label="Name"
                  required
                />
              )}
            />

            <group.AppField
              name="env"
              children={(field) => (
                <field.Autocomplete
                  options={["Development", "Production"]}
                  inputProps={{
                    variant: "outlined",
                    size: "medium",
                    label: "Environment",
                    required: true,
                  }}
                />
              )}
            />

            <Stack spacing={1}>
              <group.AppField
                name="simplified"
                children={(field) => (
                  <field.Checkbox label="Simplified setup using tags" />
                )}
              />

              <Alert color="info">
                The simplified setup automatically chooses most of the
                credentials below using a predefined pattern based on a "tag"
                you provide
              </Alert>
            </Stack>

            {simplified && (
              <group.AppField
                name="tag"
                children={(field) => (
                  <field.TextField
                    variant="outlined"
                    size="medium"
                    label="Tag"
                    helperText="Tag must be unique within the environment"
                    required
                  />
                )}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  },
});
