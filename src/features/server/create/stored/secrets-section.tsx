import { SecretManagerConfig, SecretsManagerConfigType } from "@/api/server";
import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import { withFieldGroup } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";
import ToggleButton from "@mui/material/ToggleButton";
import {
  createMemorySecretsConfig,
  createMemorySecretsConfigForm,
  memoryBaseSchema,
  memoryDefaultValues,
  memorySchema,
  SecretsMemory,
} from "./secrets/secrets-memory";
import {
  awsSecretsBaseSchema,
  awsSecretsDefaultValues,
  awsSecretsSchema,
  createAwsSecretsConfig,
  createAwsSecretsConfigForm,
  SecretsAws,
} from "./secrets/secrets-aws";

// Base schema, sets the structure and types for all variants
const secretsBaseSchema = z.object({
  provider: z.enum(SecretsManagerConfigType),
  memory: memoryBaseSchema,
  aws: awsSecretsBaseSchema,
});

// Refined schema, provides validation for each choice branch
export const secretsSectionSchema = z.discriminatedUnion("provider", [
  secretsBaseSchema.extend({
    provider: z.literal(SecretsManagerConfigType.Aws),
    aws: awsSecretsSchema,
  }),
  secretsBaseSchema.extend({
    provider: z.literal(SecretsManagerConfigType.Memory),
    memory: memorySchema,
  }),
]);

export const secretsSectionDefaultValues: z.input<typeof secretsBaseSchema> = {
  provider: SecretsManagerConfigType.Aws,
  memory: memoryDefaultValues,
  aws: awsSecretsDefaultValues,
};

export function createSecretsConfigForm(
  values: SecretManagerConfig,
): z.output<typeof secretsSectionSchema> {
  let memory =
    values.provider === SecretsManagerConfigType.Memory
      ? createMemorySecretsConfigForm(values)
      : memoryDefaultValues;

  let aws =
    values.provider === SecretsManagerConfigType.Aws
      ? createAwsSecretsConfigForm(values)
      : awsSecretsDefaultValues;

  return {
    provider: values.provider,
    memory,
    aws,
  };
}

export function createSecretsConfig(
  values: z.output<typeof secretsSectionSchema>,
): SecretManagerConfig {
  switch (values.provider) {
    case SecretsManagerConfigType.Memory:
      return createMemorySecretsConfig(values.memory);
    case SecretsManagerConfigType.Aws:
      return createAwsSecretsConfig(values.aws);
    default:
      throw new Error("unhandled secrets manager provider");
  }
}

export const SecretsSection = withFieldGroup({
  defaultValues: secretsSectionDefaultValues,
  render: function Render({ group }) {
    const valid = useStore(
      group.store,
      (group) => secretsSectionSchema.safeParse(group.values).success,
    );

    const provider = useStore(group.store, (group) => group.values.provider);

    return (
      <FormSectionAccordion title="Secrets" valid={valid}>
        <group.AppField
          name="provider"
          listeners={{
            onChange: () => {
              // Changing the variant requires a revalidating the group to remove errors
              // from hidden variants
              group.validateAllFields("change");
            },
          }}
          children={(field) => (
            <field.ToggleButtonGroup
              disableClearable
              exclusive
              label="Secrets Provider"
              helperText="Select a provider for where secrets should be sourced from and stored in"
            >
              <ToggleButton value={SecretsManagerConfigType.Aws}>
                AWS Secrets Manager <i>Compatible</i>
              </ToggleButton>

              <ToggleButton value={SecretsManagerConfigType.Memory}>
                Memory
              </ToggleButton>
            </field.ToggleButtonGroup>
          )}
        />

        {provider === SecretsManagerConfigType.Aws && (
          <SecretsAws form={group} fields="aws" />
        )}

        {provider === SecretsManagerConfigType.Memory && (
          <SecretsMemory form={group} fields="memory" />
        )}
      </FormSectionAccordion>
    );
  },
});
