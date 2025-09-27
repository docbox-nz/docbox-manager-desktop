import { withFieldGroup } from "@/hooks/use-app-form";
import { z } from "zod/v4";

export const customEndpointBaseSchema = z.object({
  endpoint: z.string(),
  access_key_id: z.string(),
  access_key_secret: z.string(),
});

export const customEndpointSchema = z.object({
  endpoint: z.url(),
  access_key_id: z.string().nonempty(),
  access_key_secret: z.string().nonempty(),
});

export const customEndpointDefaultValues: z.input<
  typeof customEndpointBaseSchema
> = {
  endpoint: "",
  access_key_id: "",
  access_key_secret: "",
};

export const StorageCustomEndpoint = withFieldGroup({
  defaultValues: customEndpointDefaultValues,
  render: function Render({ group }) {
    return (
      <>
        <group.AppField
          name="endpoint"
          children={(field) => (
            <field.TextField
              variant="outlined"
              size="medium"
              label="Endpoint"
              helperText="URL endpoint for accessing the custom S3"
            />
          )}
        />

        <group.AppField
          name="access_key_id"
          children={(field) => (
            <field.TextField
              variant="outlined"
              size="medium"
              label="Access Key ID"
              helperText="Access Key ID for accessing the custom endpoint"
            />
          )}
        />

        <group.AppField
          name="access_key_secret"
          children={(field) => (
            <field.TextField
              type="password"
              variant="outlined"
              size="medium"
              label="Access Key Secret"
              helperText="Access Key Secret for accessing the custom endpoint"
            />
          )}
        />
      </>
    );
  },
});
