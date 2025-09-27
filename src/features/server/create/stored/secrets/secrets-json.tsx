import { SecretManagerConfig, SecretsManagerConfigType } from "@/api/server";
import { withFieldGroup } from "@/hooks/use-app-form";
import { z } from "zod/v4";

// Base schema, sets the structure
export const jsonBaseSchema = z.object({
  key: z.string(),
  path: z.string(),
});

// Refined schema, provides validation for each choice branch
export const jsonSchema = z.object({
  key: z.string().nonempty(),
  path: z.string().nonempty(),
});

export const jsonDefaultValues: z.input<typeof jsonBaseSchema> = {
  key: "",
  path: "",
};

export function createJsonSecretsConfig(
  values: z.output<typeof jsonSchema>
): SecretManagerConfig {
  return {
    provider: SecretsManagerConfigType.Json,
    key: values.key,
    path: values.path,
  };
}

export const SecretsJson = withFieldGroup({
  defaultValues: jsonDefaultValues,
  render: function Render({ group }) {
    return (
      <>
        <group.AppField
          name="key"
          children={(field) => (
            <field.TextField
              required
              type="password"
              variant="outlined"
              size="medium"
              label="Secrets Encryption Key"
              helperText="Encryption key / password for encrypting and decrypting the secrets file"
            />
          )}
        />

        <group.AppField
          name="path"
          children={(field) => (
            <field.TextField
              required
              variant="outlined"
              size="medium"
              label="Secrets Path"
              helperText="Path to the secrets json file, the file must be copied for all uses (Manager and docbox itself)"
            />
          )}
        />
      </>
    );
  },
});
