import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod/v4";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Alert from "@mui/material/Alert";
import { getAPIErrorMessage } from "@/api/axios";
import { useCreateServer } from "@/api/server/server.mutations";

import RouterLink from "@/components/RouterLink";
import Container from "@mui/material/Container";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/use-app-form";
import {
  ApiSection,
  apiSectionDefaultValues,
  apiSectionSchema,
  createApiConfig,
} from "@/features/server/create/stored/api-section";
import {
  createAdminDatabaseConfig,
  DatabaseSection,
  databaseSectionDefaultValues,
  databaseSectionSchema,
} from "@/features/server/create/stored/database-section";
import {
  createSecretsConfig,
  SecretsSection,
  secretsSectionDefaultValues,
  secretsSectionSchema,
} from "@/features/server/create/stored/secrets-section";
import {
  createSearchConfig,
  SearchSection,
  searchSectionDefaultValues,
  searchSectionSchema,
} from "@/features/server/create/stored/search-section";
import {
  createStorageConfig,
  StorageSection,
  storageSectionDefaultValues,
  storageSectionSchema,
} from "@/features/server/create/stored/storage-section";
import {
  EncryptionSection,
  encryptionSectionDefaultValues,
  encryptionSectionSchema,
} from "@/features/server/create/stored/encryption-section";
import { ServerConfigData, ServerConfigType } from "@/api/server";
import { encrypt } from "@/api/utils/utils.requests";
import { ServerConfig } from "@/api/server/server.types";
import { v4 } from "uuid";

export const Route = createFileRoute("/servers/create/stored")({
  component: RouteComponent,
});

const formSchema = z.object({
  name: z.string().nonempty(),
  api: apiSectionSchema,
  database: databaseSectionSchema,
  secrets: secretsSectionSchema,
  search: searchSectionSchema,
  storage: storageSectionSchema,
  encryption: encryptionSectionSchema,
});

type FormSchema = z.input<typeof formSchema>;

const defaultValues: FormSchema = {
  name: "",
  api: apiSectionDefaultValues,
  database: databaseSectionDefaultValues,
  secrets: secretsSectionDefaultValues,
  search: searchSectionDefaultValues,
  storage: storageSectionDefaultValues,
  encryption: encryptionSectionDefaultValues,
};

const formOpts = formOptions({
  defaultValues,
  validators: {
    onSubmit: formSchema,
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const createServerMutation = useCreateServer();

  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      const config: ServerConfigData = {
        api: createApiConfig(value.api),
        database: createAdminDatabaseConfig(value.database),
        secrets: createSecretsConfig(value.secrets),
        search: createSearchConfig(value.search),
        storage: createStorageConfig(value.storage),
      };

      let serverConfig: ServerConfig;

      if (value.encryption.encrypted) {
        const encryptedConfig = await encrypt(
          value.encryption.password,
          JSON.stringify(config)
        );

        serverConfig = {
          type: ServerConfigType.Encrypted,
          salt: encryptedConfig.salt,
          nonce: encryptedConfig.nonce,
          data: encryptedConfig.data,
        };
      } else {
        serverConfig = {
          type: ServerConfigType.Config,
          data: config,
        };
      }

      await createServerMutation.mutateAsync({
        id: v4(),
        name: value.name,
        config: serverConfig,
        order: 0,
      });

      toast.success("Added new server!");
      navigate({ to: "/" });
    },
  });

  console.log(form.getAllErrors());

  return (
    <Container sx={{ py: 2 }}>
      <Card>
        <CardHeader
          title="Stored"
          subheader="Enter the secret that contains the server configuration"
          action={
            <Button
              component={RouterLink}
              to="/servers/create"
              sx={{ my: 1, mr: 1 }}
            >
              Back
            </Button>
          }
        />
        <CardContent sx={{ py: 0 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <Stack spacing={3}>
              <form.AppField
                name="name"
                children={(field) => (
                  <field.TextField
                    variant="outlined"
                    size="medium"
                    label="Server Name"
                    helperText="Name the docbox server"
                  />
                )}
              />

              <ApiSection form={form} fields="api" />
              <DatabaseSection form={form} fields="database" />
              <SecretsSection form={form} fields="secrets" />
              <SearchSection form={form} fields="search" />
              <StorageSection form={form} fields="storage" />
              <EncryptionSection form={form} fields="encryption" />

              {createServerMutation.isError && (
                <Alert color="error">
                  Failed to create:{" "}
                  {getAPIErrorMessage(createServerMutation.error)}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                loading={createServerMutation.isPending}
              >
                Create
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
