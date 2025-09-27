import FormSectionAccordion from "@/components/form/FormSectionAccordion";
import { withFieldGroup } from "@/hooks/use-app-form";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";
import SolarShieldWarningBoldDuotone from "~icons/solar/shield-warning-bold-duotone";

// Base schema, sets the structure and types for all variants
const encryptionSectionBaseSchema = z.object({
  encrypted: z.boolean(),
  password: z.string(),
  confirmPassword: z.string(),
});

// Refined schema, provides validation for each choice branch
export const encryptionSectionSchema = z.discriminatedUnion("encrypted", [
  encryptionSectionBaseSchema
    .extend({
      encrypted: z.literal(true),
      password: z.string().nonempty(),
      confirmPassword: z.string().nonempty(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),
  encryptionSectionBaseSchema.extend({
    encrypted: z.literal(false),
  }),
]);

export const encryptionSectionDefaultValues: z.input<
  typeof encryptionSectionBaseSchema
> = {
  encrypted: true,
  password: "",
  confirmPassword: "",
};

export const EncryptionSection = withFieldGroup({
  defaultValues: encryptionSectionDefaultValues,
  render: function Render({ group }) {
    const valid = useStore(
      group.store,
      (group) => encryptionSectionSchema.safeParse(group.values).success
    );
    const encrypted = useStore(group.store, (group) => group.values.encrypted);

    return (
      <FormSectionAccordion title="Encryption" valid={valid}>
        <group.AppField
          name="encrypted"
          listeners={{
            onChange: () => {
              // Changing the variant requires a revalidating the group to remove errors
              // from hidden variants
              group.validateAllFields("change");
            },
          }}
          children={(field) => (
            <field.Switch
              label="Encrypted"
              helperText="Encrypt the provided credentials before storing. Will be required to enter a password unlock and use the server"
            />
          )}
        />

        {encrypted ? (
          <>
            <group.AppField
              name="password"
              children={(field) => (
                <field.TextField
                  type="password"
                  variant="outlined"
                  size="medium"
                  label="Encryption Password"
                  helperText="Password for encrypting the stored credentials."
                />
              )}
            />

            <group.AppField
              name="confirmPassword"
              children={(field) => (
                <field.TextField
                  type="password"
                  variant="outlined"
                  size="medium"
                  label="Confirm Password"
                />
              )}
            />
          </>
        ) : (
          <Alert
            color="warning"
            icon={<SolarShieldWarningBoldDuotone fontSize={18} />}
          >
            <AlertTitle>Warning</AlertTitle>
            Disabling encryption is not recommend for production. This will
            store credentials in plain text within the local{" "}
            <b>Docbox Manager</b> database.
          </Alert>
        )}
      </FormSectionAccordion>
    );
  },
});
