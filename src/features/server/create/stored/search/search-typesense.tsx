import { withFieldGroup } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import { z } from "zod/v4";
import Alert from "@mui/material/Alert";
import SolarInfoCircleBold from "~icons/solar/info-circle-bold";

// Base schema, sets the structure
const typesenseApiKeyBaseSchema = z.object({
  api_key: z.string(),
  api_key_secret_name: z.string(),
  use_secret: z.boolean(),
});

// Base schema, sets the structure
export const typesenseBaseSchema = z.object({
  url: z.string(),
  api_key: typesenseApiKeyBaseSchema,
});

// Refined schema, provides validation for each choice branch
export const typesenseSchema = z.object({
  url: z.url(),
  api_key: z.discriminatedUnion("use_secret", [
    typesenseApiKeyBaseSchema.extend({
      use_secret: z.literal(true),
      api_key_secret_name: z.string().nonempty(),
    }),
    typesenseApiKeyBaseSchema.extend({
      use_secret: z.literal(false),
      api_key: z.string().nonempty(),
    }),
  ]),
});

export const typesenseDefaultValues: z.input<typeof typesenseBaseSchema> = {
  url: "",
  api_key: {
    use_secret: true,
    api_key: "",
    api_key_secret_name: "typesense/docbox/credentials",
  },
};

export const SearchTypesense = withFieldGroup({
  defaultValues: typesenseDefaultValues,
  render: function Render({ group }) {
    const useSecret = useStore(
      group.store,
      (group) => group.values.api_key.use_secret
    );

    return (
      <>
        <group.AppField
          name="url"
          children={(field) => (
            <field.TextField
              variant="outlined"
              size="medium"
              label="URL"
              helperText="Base URL for the typesense search server"
            />
          )}
        />

        <group.AppField
          name="api_key.use_secret"
          children={(field) => (
            <field.Switch
              label="Use secrets manager"
              helperText="Load the typesense API key from from a secret manager secret"
            />
          )}
        />

        {useSecret ? (
          <>
            <group.AppField
              name="api_key.api_key_secret_name"
              children={(field) => (
                <field.TextField
                  variant="outlined"
                  size="medium"
                  label="API Key Secret Name"
                  helperText="Secret manager secret name containing the search API key"
                />
              )}
            />

            <Alert color="info" icon={<SolarInfoCircleBold fontSize={18} />}>
              The secret stored in the secret manager must be a plain text
              secret containing the API key
            </Alert>
          </>
        ) : (
          <>
            <group.AppField
              name="api_key.api_key"
              children={(field) => (
                <field.TextField
                  type="password"
                  variant="outlined"
                  size="medium"
                  label="API Key"
                  helperText="API key for the search index"
                />
              )}
            />
          </>
        )}
      </>
    );
  },
});
