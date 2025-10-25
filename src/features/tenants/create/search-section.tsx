import { withFieldGroup } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import z from "zod/v4";
import { DEFAULT_TAG } from "./tenant-section";
import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import InputAdornment from "@mui/material/InputAdornment";

export const searchSectionSchema = z.object({
  search_index_name: z
    .stringFormat("search-index-name", /^[a-z0-9_-]+$/, {
      message:
        "Search index name must only container lowercase letters, numbers, dashes and underscores",
    })
    .nonempty(),
});

export const searchSectionDefaultValues: z.input<typeof searchSectionSchema> = {
  search_index_name: DEFAULT_TAG,
};

export const SearchSection = withFieldGroup({
  props: {
    environmentTag: "tag",
  },
  defaultValues: searchSectionDefaultValues,
  render: function Render({ group, environmentTag }) {
    const valid = useStore(
      group.store,
      (state) => searchSectionSchema.safeParse(state.values).success,
    );

    return (
      <FormSectionAccordion title="Search" valid={valid}>
        <group.AppField
          name="search_index_name"
          children={(field) => (
            <field.TextField
              variant="outlined"
              size="medium"
              label="Search Index Name"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">docbox-</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      -{environmentTag}
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </FormSectionAccordion>
    );
  },
});
