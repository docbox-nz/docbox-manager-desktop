import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import { withFieldGroup } from "@/hooks/use-app-form";
import Typography from "@mui/material/Typography";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";

export const apiSectionSchema = z.object({
  url: z.url(),
  api_key: z.string(),
});

export const apiSectionDefaultValues: z.input<typeof apiSectionSchema> = {
  url: "",
  api_key: "",
};

export const ApiSection = withFieldGroup({
  defaultValues: apiSectionDefaultValues,
  render: function Render({ group }) {
    const valid = useStore(
      group.store,
      (group) => apiSectionSchema.safeParse(group.values).success
    );

    return (
      <FormSectionAccordion title="Docbox API" valid={valid}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: "sm" }}
        >
          Credentials for connecting to docbox, these are required to perform
          tenant browsing to allow looking through the boxes, files, links, and
          folders within each tenant.
        </Typography>

        <group.AppField
          name="url"
          children={(field) => (
            <field.TextField
              required
              variant="outlined"
              size="medium"
              label="Docbox API URL"
              helperText="HTTP URL of the docbox app"
              placeholder="http://example.com:8080"
            />
          )}
        />

        <group.AppField
          name="api_key"
          children={(field) => (
            <field.TextField
              type="password"
              variant="outlined"
              size="medium"
              label="Docbox API Key"
              helperText="API key for accessing docbox if configured on the server. Leave empty if not configured"
            />
          )}
        />
      </FormSectionAccordion>
    );
  },
});
