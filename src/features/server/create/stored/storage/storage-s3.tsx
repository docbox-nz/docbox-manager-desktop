import { withFieldGroup } from "@/hooks/use-app-form";
import { z } from "zod/v4";
import {
  customEndpointBaseSchema,
  customEndpointDefaultValues,
  customEndpointSchema,
  StorageCustomEndpoint,
} from "./storage-custom-endpoint";
import { S3EndpointType } from "@/api/server";
import ToggleButton from "@mui/material/ToggleButton";
import { useStore } from "@tanstack/react-form";

const storageEndpointBaseSchema = z.object({
  type: z.enum(S3EndpointType),
  custom: customEndpointBaseSchema,
});

export const s3BaseSchema = z.object({
  endpoint: storageEndpointBaseSchema,
});

export const s3Schema = z.object({
  endpoint: z.discriminatedUnion("type", [
    storageEndpointBaseSchema.extend({
      type: z.literal(S3EndpointType.Aws),
    }),
    storageEndpointBaseSchema.extend({
      type: z.literal(S3EndpointType.Custom),
      custom: customEndpointSchema,
    }),
  ]),
});

export const s3DefaultValues: z.input<typeof s3BaseSchema> = {
  endpoint: {
    type: S3EndpointType.Aws,
    custom: customEndpointDefaultValues,
  },
};

export const StorageS3 = withFieldGroup({
  defaultValues: s3DefaultValues,
  render: function Render({ group }) {
    const endpointType = useStore(
      group.store,
      (group) => group.values.endpoint.type
    );

    return (
      <>
        <group.AppField
          name="endpoint.type"
          children={(field) => (
            <field.ToggleButtonGroup
              disableClearable
              exclusive
              label="Storage Endpoint"
              helperText="Select a S3 endpoint that should be used for storage"
            >
              <ToggleButton value={S3EndpointType.Aws}>AWS S3</ToggleButton>
              <ToggleButton value={S3EndpointType.Custom}>
                S3 Compatible
              </ToggleButton>
            </field.ToggleButtonGroup>
          )}
        />

        {endpointType === S3EndpointType.Custom && (
          <StorageCustomEndpoint form={group} fields="endpoint.custom" />
        )}
      </>
    );
  },
});
