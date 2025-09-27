import { SecretsManagerConfigType } from "@/api/server";
import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import { withFieldGroup } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";
import ToggleButton from "@mui/material/ToggleButton";
import {
  jsonBaseSchema,
  jsonDefaultValues,
  jsonSchema,
  SecretsJson,
} from "./secrets/secrets-json";
import {
  memoryBaseSchema,
  memoryDefaultValues,
  memorySchema,
  SecretsMemory,
} from "./secrets/secrets-memory";

// Base schema, sets the structure and types for all variants
const secretsBaseSchema = z.object({
  provider: z.enum(SecretsManagerConfigType),
  memory: memoryBaseSchema,
  json: jsonBaseSchema,
});

// Refined schema, provides validation for each choice branch
export const secretsSectionSchema = z.discriminatedUnion("provider", [
  secretsBaseSchema.extend({
    provider: z.literal(SecretsManagerConfigType.Aws),
  }),
  secretsBaseSchema.extend({
    provider: z.literal(SecretsManagerConfigType.Json),
    json: jsonSchema,
  }),
  secretsBaseSchema.extend({
    provider: z.literal(SecretsManagerConfigType.Memory),
    memory: memorySchema,
  }),
]);

export const secretsSectionDefaultValues: z.input<typeof secretsBaseSchema> = {
  provider: SecretsManagerConfigType.Aws,
  memory: memoryDefaultValues,
  json: jsonDefaultValues,
};

export const SecretsSection = withFieldGroup({
  defaultValues: secretsSectionDefaultValues,
  render: function Render({ group }) {
    const valid = useStore(
      group.store,
      (group) => secretsSectionSchema.safeParse(group.values).success
    );

    const provider = useStore(group.store, (group) => group.values.provider);

    return (
      <FormSectionAccordion title="Secrets" valid={valid}>
        <group.AppField
          name="provider"
          children={(field) => (
            <field.ToggleButtonGroup
              disableClearable
              exclusive
              label="Secrets Provider"
              helperText="Select a provider for where secrets should be sourced from and stored in"
            >
              <ToggleButton value={SecretsManagerConfigType.Aws}>
                AWS
              </ToggleButton>

              <ToggleButton value={SecretsManagerConfigType.Json}>
                Encrypted JSON
              </ToggleButton>

              <ToggleButton value={SecretsManagerConfigType.Memory}>
                Memory
              </ToggleButton>
            </field.ToggleButtonGroup>
          )}
        />

        {provider === SecretsManagerConfigType.Json && (
          <SecretsJson form={group} fields="json" />
        )}

        {provider === SecretsManagerConfigType.Memory && (
          <SecretsMemory form={group} fields="memory" />
        )}
      </FormSectionAccordion>
    );
  },
});
