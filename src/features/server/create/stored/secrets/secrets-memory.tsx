import { SecretManagerConfig, SecretsManagerConfigType } from "@/api/server";
import { withFieldGroup } from "@/hooks/use-app-form";
import { z } from "zod/v4";

// Base schema, sets the structure
export const memoryBaseSchema = z.object({
  secrets: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
  default: z.string(),
});

// Refined schema, provides validation for each choice branch
export const memorySchema = z.object({
  secrets: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
  default: z.string(),
});

export const memoryDefaultValues: z.input<typeof memoryBaseSchema> = {
  secrets: [],
  default: "",
};

export function createMemorySecretsConfig(
  values: z.output<typeof memorySchema>
): SecretManagerConfig {
  let defaultValue: string | undefined = values.default;
  if (defaultValue.trim().length < 1) {
    defaultValue = undefined;
  }

  return {
    provider: SecretsManagerConfigType.Memory,
    secrets: values.secrets.reduce(
      (output, { key, value }) => {
        output[key] = value;
        return output;
      },
      {} as Record<string, string>
    ),
    default: defaultValue,
  };
}

export const SecretsMemory = withFieldGroup({
  defaultValues: memoryDefaultValues,
  render: function Render({ group }) {
    return (
      <>
        {/* TODO: secrets */}

        <group.AppField
          name="default"
          children={(field) => (
            <field.TextField
              variant="outlined"
              size="medium"
              label="Default Secret"
              helperText="Default secret value to provide when one is not found (Optional)"
            />
          )}
        />
      </>
    );
  },
});
