import ServerToolbar from "@/components/ServerToolbar";
import { useServerContext } from "@/context/server-context";
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
  apiSectionSchema,
  createApiConfig,
  createApiConfigForm,
} from "@/features/server/create/stored/api-section";
import {
  createAdminDatabaseConfig,
  createAdminDatabaseConfigForm,
  DatabaseSection,
  databaseSectionSchema,
} from "@/features/server/create/stored/database-section";
import {
  createSecretsConfig,
  createSecretsConfigForm,
  SecretsSection,
  secretsSectionSchema,
} from "@/features/server/create/stored/secrets-section";
import {
  createSearchConfig,
  createSearchConfigForm,
  SearchSection,
  searchSectionSchema,
} from "@/features/server/create/stored/search-section";
import {
  createStorageConfig,
  createStorageConfigForm,
  StorageSection,
  storageSectionSchema,
} from "@/features/server/create/stored/storage-section";
import { ServerConfigData } from "@/api/server";
import { getServerConfig } from "@/api/server/server.requests";
import { useMemo } from "react";
import LoadingPage from "@/components/LoadingPage";
import { Server } from "@/api/server/server.types";

export const Route = createFileRoute("/servers/$serverId/edit")({
  component: RouteComponent,
  loader: async ({ params, parentMatchPromise }) => {
    await parentMatchPromise;

    const serverConfig = await getServerConfig(params.serverId);
    return { serverConfig };
  },
  pendingComponent: () => <LoadingPage message="Loading server config..." />,
});

const formSchema = z.object({
  name: z.string().nonempty(),
  api: apiSectionSchema,
  database: databaseSectionSchema,
  secrets: secretsSectionSchema,
  search: searchSectionSchema,
  storage: storageSectionSchema,
});

type FormSchema = z.input<typeof formSchema>;

function createServerConfigDataForm(
  server: Server,
  values: ServerConfigData,
): z.input<typeof formSchema> {
  return {
    name: server.name,
    api: createApiConfigForm(values.api),
    database: createAdminDatabaseConfigForm(values.database),
    secrets: createSecretsConfigForm(values.secrets),
    search: createSearchConfigForm(values.search),
    storage: createStorageConfigForm(values.storage),
  };
}

function createServerConfigData(
  values: z.output<typeof formSchema>,
): ServerConfigData {
  return {
    api: createApiConfig(values.api),
    database: createAdminDatabaseConfig(values.database),
    secrets: createSecretsConfig(values.secrets),
    search: createSearchConfig(values.search),
    storage: createStorageConfig(values.storage),
  };
}

function RouteComponent() {
  const { serverConfig } = Route.useLoaderData();
  const server = useServerContext();
  const navigate = useNavigate();
  const createServerMutation = useCreateServer();

  const defaultValues: FormSchema = useMemo(
    () => createServerConfigDataForm(server, serverConfig),
    [server, serverConfig],
  );

  const formOpts = formOptions({
    defaultValues,
    validators: {
      onSubmit: formSchema,
    },
  });

  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value, formApi }) => {
      const config: ServerConfigData = createServerConfigData(value);

      // let serverConfig: ServerConfig = {
      //
      // };

      console.log(config);

      // console.log(serverConfig);

      // TODO: Update server mutation
      // await createServerMutation.mutateAsync({
      //   id: v4(),
      //   name: value.name,
      //   config: serverConfig,
      //   order: 0,
      // });

      toast.success("Updated server!");
      navigate({ to: "/servers/$serverId", params: { serverId: server.id } });

      formApi.reset();
    },
  });

  return (
    <Stack>
      <ServerToolbar server={server} />

      <Container sx={{ py: 2 }}>
        <Card>
          <CardHeader
            title="Update Server"
            subheader="Update the configuration of a server"
            action={
              <Button
                component={RouterLink}
                to="/servers/$serverId"
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

                {createServerMutation.isError && (
                  <Alert severity="error">
                    Failed to create:{" "}
                    {getAPIErrorMessage(createServerMutation.error)}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  loading={createServerMutation.isPending}
                  disabled
                >
                  Update (Not Yet Implemented)
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Stack>
  );
}
