import { withFieldGroup } from "@/hooks/use-app-form";
import { z } from "zod/v4";
import {
  customEndpointBaseSchema,
  customEndpointDefaultValues,
  customEndpointSchema,
} from "./secrets-custom-endpoint";
import {
  SecretManagerConfig,
  SecretsEndpoint,
  SecretsEndpointType,
  SecretsManagerConfigType,
} from "@/api/server";
import ToggleButton from "@mui/material/ToggleButton";
import { useStore } from "@tanstack/react-form";
import { SecretsCustomEndpoint } from "./secrets-custom-endpoint";

const secretsEndpointBaseSchema = z.object({
  type: z.enum(SecretsEndpointType),
  custom: customEndpointBaseSchema,
});

export const awsSecretsBaseSchema = z.object({
  endpoint: secretsEndpointBaseSchema,
});

export const awsSecretsSchema = z.object({
  endpoint: z.discriminatedUnion("type", [
    secretsEndpointBaseSchema.extend({
      type: z.literal(SecretsEndpointType.Aws),
    }),
    secretsEndpointBaseSchema.extend({
      type: z.literal(SecretsEndpointType.Custom),
      custom: customEndpointSchema,
    }),
  ]),
});

export const awsSecretsDefaultValues: z.input<typeof awsSecretsBaseSchema> = {
  endpoint: {
    type: SecretsEndpointType.Aws,
    custom: customEndpointDefaultValues,
  },
};

export function createAwsSecretsConfig(
  values: z.output<typeof awsSecretsSchema>,
): SecretManagerConfig {
  let endpoint: SecretsEndpoint;
  switch (values.endpoint.type) {
    case SecretsEndpointType.Aws: {
      endpoint = {
        type: SecretsEndpointType.Aws,
      };
      break;
    }
    case SecretsEndpointType.Custom: {
      endpoint = {
        type: SecretsEndpointType.Custom,
        endpoint: values.endpoint.custom.endpoint,
        access_key_id: values.endpoint.custom.access_key_id,
        access_key_secret: values.endpoint.custom.access_key_secret,
      };
      break;
    }
    default:
      throw new Error("unhandled s3 endpoint type");
  }

  return {
    provider: SecretsManagerConfigType.Aws,
    endpoint,
  };
}

export const SecretsAws = withFieldGroup({
  defaultValues: awsSecretsDefaultValues,
  render: function Render({ group }) {
    const endpointType = useStore(
      group.store,
      (group) => group.values.endpoint.type,
    );

    return (
      <>
        <group.AppField
          name="endpoint.type"
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
              label="Secrets Endpoint"
              helperText="Select a secrets endpoint that should be used"
            >
              <ToggleButton value={SecretsEndpointType.Aws}>AWS</ToggleButton>
              <ToggleButton value={SecretsEndpointType.Custom}>
                Custom Compatible Server
              </ToggleButton>
            </field.ToggleButtonGroup>
          )}
        />

        {endpointType === SecretsEndpointType.Custom && (
          <SecretsCustomEndpoint form={group} fields="endpoint.custom" />
        )}
      </>
    );
  },
});
