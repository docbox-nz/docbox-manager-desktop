import { SearchConfig, SearchIndexFactoryConfigType } from "@/api/server";
import { withFieldGroup } from "@/hooks/use-app-form";
import { z } from "zod/v4";

export const opensearchBaseSchema = z.object({
  url: z.string(),
});

// Refined schema, provides validation for each choice branch
export const opensearchSchema = z.object({
  url: z.url(),
});

export const opensearchDefaultValues: z.input<typeof opensearchBaseSchema> = {
  url: "",
};

export function createOpensearchSearchConfig(
  values: z.output<typeof opensearchSchema>
): SearchConfig {
  return {
    provider: SearchIndexFactoryConfigType.OpenSearch,
    url: values.url,
  };
}

export const SearchOpensearch = withFieldGroup({
  defaultValues: opensearchDefaultValues,
  render: function Render({ group }) {
    return (
      <>
        <group.AppField
          name="url"
          children={(field) => (
            <field.TextField
              variant="outlined"
              size="medium"
              label="URL"
              helperText="Base URL for the OpenSearch server"
            />
          )}
        />
      </>
    );
  },
});
