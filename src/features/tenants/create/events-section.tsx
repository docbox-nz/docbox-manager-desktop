import { withFieldGroup } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import z from "zod/v4";
import FormSectionAccordion from "@/components/form/FormSectionAccordion";

export const eventsSectionSchema = z.object({
  event_queue_url: z.string(),
});

export const eventsSectionDefaultValues: z.input<typeof eventsSectionSchema> = {
  event_queue_url: "",
};

export const EventsSection = withFieldGroup({
  defaultValues: eventsSectionDefaultValues,
  render: function Render({ group }) {
    const valid = useStore(
      group.store,
      (state) => eventsSectionSchema.safeParse(state.values).success
    );

    return (
      <FormSectionAccordion title="Event Notifications" valid={valid}>
        <group.AppField
          name="event_queue_url"
          children={(field) => (
            <field.TextField
              variant="outlined"
              size="medium"
              label="Event Queue URL"
              helperText="Optional: SQS Queue URL to send notifications to when certain events occur such as file uploads"
            />
          )}
        />
      </FormSectionAccordion>
    );
  },
});
