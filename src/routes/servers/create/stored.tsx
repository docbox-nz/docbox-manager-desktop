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
} from "@/features/server/create/stored/api-section";
import {
  DatabaseSection,
  databaseSectionDefaultValues,
  databaseSectionSchema,
} from "@/features/server/create/stored/database-section";
import {
  SecretsSection,
  secretsSectionDefaultValues,
  secretsSectionSchema,
} from "@/features/server/create/stored/secrets-section";
import {
  SearchSection,
  searchSectionDefaultValues,
  searchSectionSchema,
} from "@/features/server/create/stored/search-section";
import {
  StorageSection,
  storageSectionDefaultValues,
  storageSectionSchema,
} from "@/features/server/create/stored/storage-section";
import {
  EncryptionSection,
  encryptionSectionDefaultValues,
  encryptionSectionSchema,
} from "@/features/server/create/stored/encryption-section";

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
    onMount: formSchema,
    onChange: formSchema,
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const createServerMutation = useCreateServer();

  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      // await createServerMutation.mutateAsync({
      //   id: v4(),
      //   name: value.name,
      //   config: {
      //     type: ServerConfigType.Config,
      //     data: {
      //       api_url: value.api_url,
      //       api_key: value.api_key,
      //       database: {
      //         host: value.database.host,
      //         port: value.database.port,
      //       },
      //     },
      //   },
      //   order: 0,
      // });

      toast.success("Added new server!");
      navigate({ to: "/" });
    },
  });

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
