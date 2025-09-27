import {
  StorageLayerConfig,
  StorageLayerFactoryConfigType,
} from "@/api/server";
import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import { withFieldGroup } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";
import ToggleButton from "@mui/material/ToggleButton";

import {
  createS3StorageConfig,
  s3BaseSchema,
  s3DefaultValues,
  s3Schema,
  StorageS3,
} from "./storage/storage-s3";

// Base schema, sets the structure and types for all variants
const storageBaseSchema = z.object({
  provider: z.enum(StorageLayerFactoryConfigType),
  s3: s3BaseSchema,
});

// Refined schema, provides validation for each choice branch
export const storageSectionSchema = z.discriminatedUnion("provider", [
  storageBaseSchema.extend({
    provider: z.literal(StorageLayerFactoryConfigType.S3),
    s3: s3Schema,
  }),
]);

export const storageSectionDefaultValues: z.input<typeof storageBaseSchema> = {
  provider: StorageLayerFactoryConfigType.S3,
  s3: s3DefaultValues,
};

export function createStorageConfig(
  values: z.output<typeof storageSectionSchema>
): StorageLayerConfig {
  switch (values.provider) {
    case StorageLayerFactoryConfigType.S3:
      return createS3StorageConfig(values.s3);
    default:
      throw new Error("unhandled secrets manager provider");
  }
}

export const StorageSection = withFieldGroup({
  defaultValues: storageSectionDefaultValues,
  render: function Render({ group }) {
    const valid = useStore(
      group.store,
      (group) => storageSectionSchema.safeParse(group.values).success
    );

    const provider = useStore(group.store, (group) => group.values.provider);

    return (
      <FormSectionAccordion title="Storage" valid={valid}>
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
              label="Storage Provider"
              helperText="Select a provider that should be used for storage"
            >
              <ToggleButton value={StorageLayerFactoryConfigType.S3}>
                S3 Compatible
              </ToggleButton>
            </field.ToggleButtonGroup>
          )}
        />

        {provider === StorageLayerFactoryConfigType.S3 && (
          <StorageS3 form={group} fields="s3" />
        )}
      </FormSectionAccordion>
    );
  },
});
