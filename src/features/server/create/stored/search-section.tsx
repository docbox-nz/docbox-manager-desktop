import { SearchIndexFactoryConfigType } from "@/api/server";
import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import { withFieldGroup } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";
import ToggleButton from "@mui/material/ToggleButton";
import {
  SearchTypesense,
  typesenseBaseSchema,
  typesenseDefaultValues,
  typesenseSchema,
} from "./search/search-typesense";
import {
  opensearchBaseSchema,
  opensearchDefaultValues,
  opensearchSchema,
  SearchOpensearch,
} from "./search/search-opensearch";

// Base schema, sets the structure and types for all variants
const searchBaseSchema = z.object({
  provider: z.enum(SearchIndexFactoryConfigType),
  typesense: typesenseBaseSchema,
  opensearch: opensearchBaseSchema,
});

// Refined schema, provides validation for each choice branch
export const searchSectionSchema = z.discriminatedUnion("provider", [
  searchBaseSchema.extend({
    provider: z.literal(SearchIndexFactoryConfigType.Typesense),
    typesense: typesenseSchema,
  }),
  searchBaseSchema.extend({
    provider: z.literal(SearchIndexFactoryConfigType.OpenSearch),
    opensearch: opensearchSchema,
  }),
  searchBaseSchema.extend({
    provider: z.literal(SearchIndexFactoryConfigType.Database),
  }),
]);

export const searchSectionDefaultValues: z.input<typeof searchBaseSchema> = {
  provider: SearchIndexFactoryConfigType.Typesense,
  typesense: typesenseDefaultValues,
  opensearch: opensearchDefaultValues,
};

export const SearchSection = withFieldGroup({
  defaultValues: searchSectionDefaultValues,
  render: function Render({ group }) {
    const valid = useStore(
      group.store,
      (group) => searchSectionSchema.safeParse(group.values).success
    );

    const provider = useStore(group.store, (group) => group.values.provider);

    return (
      <FormSectionAccordion title="Search" valid={valid}>
        <group.AppField
          name="provider"
          children={(field) => (
            <field.ToggleButtonGroup
              disableClearable
              exclusive
              label="Search Provider"
              helperText="Select a provider that should be used for search index data"
            >
              <ToggleButton value={SearchIndexFactoryConfigType.Typesense}>
                Typesense
              </ToggleButton>

              <ToggleButton value={SearchIndexFactoryConfigType.Database}>
                Database
              </ToggleButton>

              <ToggleButton value={SearchIndexFactoryConfigType.OpenSearch}>
                OpenSearch
              </ToggleButton>
            </field.ToggleButtonGroup>
          )}
        />

        {provider === SearchIndexFactoryConfigType.Typesense && (
          <SearchTypesense form={group} fields="typesense" />
        )}

        {provider === SearchIndexFactoryConfigType.OpenSearch && (
          <SearchOpensearch form={group} fields="opensearch" />
        )}
      </FormSectionAccordion>
    );
  },
});
