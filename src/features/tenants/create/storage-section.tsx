import { withFieldGroup } from "@/hooks/use-app-form";
import Stack from "@mui/material/Stack";
import { useStore } from "@tanstack/react-form";
import z from "zod/v4";
import { DEFAULT_TAG } from "./tenant-section";
import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export const storageSectionSchema = z.object({
  storage_bucket_name: z.string().nonempty(),
  s3_queue_arn: z.string(),
  storage_cors_origins: z.array(z.string()),
});

export const storageSectionDefaultValues: z.input<typeof storageSectionSchema> =
  {
    storage_bucket_name: DEFAULT_TAG,
    s3_queue_arn: "",
    storage_cors_origins: [""],
  };

export const StorageSection = withFieldGroup({
  props: {
    environmentTag: "tag",
  },
  defaultValues: storageSectionDefaultValues,
  render: function Render({ group, environmentTag }) {
    const valid = useStore(
      group.store,
      (state) => storageSectionSchema.safeParse(state.values).success
    );

    return (
      <FormSectionAccordion title="Storage" valid={valid}>
        <Stack spacing={3}>
          <group.AppField
            name="storage_bucket_name"
            children={(field) => (
              <field.TextField
                variant="outlined"
                size="medium"
                label="S3 Bucket Name"
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

          <group.AppField
            name="s3_queue_arn"
            children={(field) => (
              <field.TextField
                variant="outlined"
                size="medium"
                label="Notification Queue ARN"
                helperText="ARN for the notification queue for presigned upload file creation events. Required for presigned uploads to work"
              />
            )}
          />
        </Stack>

        <Stack spacing={2} sx={{ mt: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontSize: 16 }}>
              CORS Origins
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Specify allowed origins for CORS access to the S3 bucket, this is
              required for presigned uploads from web applications
            </Typography>
          </Stack>

          <group.AppField name="storage_cors_origins" mode="array">
            {(field) => {
              return (
                <Stack spacing={3}>
                  {field.state.value.map((_, i) => {
                    return (
                      <group.AppField
                        key={i}
                        name={`storage_cors_origins[${i}]`}
                      >
                        {(subField) => {
                          return (
                            <Stack direction="row" spacing={2}>
                              <subField.TextField
                                variant="outlined"
                                size="medium"
                                label={`Origin ${i + 1}`}
                                placeholder="https://example.com"
                              />

                              <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => field.removeValue(i)}
                              >
                                Remove
                              </Button>
                            </Stack>
                          );
                        }}
                      </group.AppField>
                    );
                  })}

                  <Button
                    variant="contained"
                    onClick={() =>
                      field.pushValue("", { dontUpdateMeta: true })
                    }
                    type="button"
                  >
                    Add Origin
                  </Button>
                </Stack>
              );
            }}
          </group.AppField>
        </Stack>
      </FormSectionAccordion>
    );
  },
});
