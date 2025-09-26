import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Alert from "@mui/material/Alert";
import { getAPIErrorMessage } from "@/api/axios";
import { FormTextField } from "@/components/form/FormTextField";
import { useCreateServer } from "@/api/server/server.mutations";
import MdiArrowDownDrop from "~icons/mdi/arrow-down-drop";

import {
  S3EndpointType,
  SearchIndexFactoryConfigType,
  SecretsManagerConfigType,
  StorageLayerFactoryConfigType,
} from "@/api/server";
import RouterLink from "@/components/RouterLink";
import Container from "@mui/material/Container";
import { toast } from "sonner";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";
import { FormNumberField } from "@/components/form/FormNumberField";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import FormValidIndicator from "@/components/form/FormValidIndicator";
import Paper from "@mui/material/Paper";
import SolarInfoCircleBold from "~icons/solar/info-circle-bold";

export const Route = createFileRoute("/servers/create/stored")({
  component: RouteComponent,
});

const setupUserBaseSchema = z.object({
  use_secret: z.boolean(),
  username: z.string(),
  password: z.string(),
  secret_name: z.string(),
});

const secretsBaseSchema = z.object({
  provider: z.enum(SecretsManagerConfigType),
  memory: z.object({
    secrets: z.array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    ),
    default: z.string(),
  }),
  json: z.object({
    key: z.string(),
    path: z.string(),
  }),
});

const typesenseApiKeyBaseSchema = z.object({
  api_key: z.string(),
  api_key_secret_name: z.string(),
  use_secret: z.boolean(),
});

const searchBaseSchema = z.object({
  provider: z.enum(SearchIndexFactoryConfigType),
  typesense: z.object({
    url: z.string(),
    api_key: typesenseApiKeyBaseSchema,
  }),
  opensearch: z.object({
    url: z.string(),
  }),
});

const storageEndpointBaseSchema = z.object({
  type: z.enum(S3EndpointType),
  custom: z.object({
    endpoint: z.string(),
    access_key_id: z.string(),
    access_key_secret: z.string(),
  }),
});

const storageBaseSchema = z.object({
  provider: z.enum(StorageLayerFactoryConfigType),
  endpoint: storageEndpointBaseSchema,
});

const apiSchema = z.object({
  url: z.url(),
  api_key: z.string(),
});

const databaseSchema = z.object({
  // Base credentials
  host: z.string().nonempty(),
  port: z.number(),

  setup_user: z.discriminatedUnion("use_secret", [
    // Setup user when using a secret
    setupUserBaseSchema.extend({
      use_secret: z.literal(true),
      secret_name: z.string().nonempty(),
    }),

    // Setup user when using provided username and password
    setupUserBaseSchema.extend({
      use_secret: z.literal(false),
      username: z.string().nonempty(),
      password: z.string().nonempty(),
    }),
  ]),

  // Root secret
  root_secret_name: z.string().nonempty(),
});

const secretsSchema = z.discriminatedUnion("provider", [
  secretsBaseSchema.extend({
    provider: z.literal(SecretsManagerConfigType.Aws),
  }),
  secretsBaseSchema.extend({
    provider: z.literal(SecretsManagerConfigType.Json),
    json: z.object({
      key: z.string().nonempty(),
      path: z.string().nonempty(),
    }),
  }),
  secretsBaseSchema.extend({
    provider: z.literal(SecretsManagerConfigType.Memory),
    memory: z.object({
      secrets: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      ),
      default: z.string(),
    }),
  }),
]);

const searchSchema = z.discriminatedUnion("provider", [
  searchBaseSchema.omit({ typesense: true }).extend({
    provider: z.literal(SearchIndexFactoryConfigType.Typesense),
    typesense: z.object({
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
    }),
  }),
  searchBaseSchema.omit({ opensearch: true }).extend({
    provider: z.literal(SearchIndexFactoryConfigType.OpenSearch),
    opensearch: z.object({
      url: z.url(),
    }),
  }),
  searchBaseSchema.extend({
    provider: z.literal(SearchIndexFactoryConfigType.Database),
  }),
]);

const storageSchema = z.discriminatedUnion("provider", [
  storageBaseSchema.extend({
    provider: z.literal(StorageLayerFactoryConfigType.S3),
    endpoint: z.discriminatedUnion("type", [
      storageEndpointBaseSchema.extend({
        type: z.literal(S3EndpointType.Aws),
      }),
      storageEndpointBaseSchema.extend({
        type: z.literal(S3EndpointType.Custom),
        custom: z.object({
          endpoint: z.url(),
          access_key_id: z.string().nonempty(),
          access_key_secret: z.string().nonempty(),
        }),
      }),
    ]),
  }),
]);

const formSchema = z.object({
  name: z.string().nonempty(),
  api: apiSchema,
  database: databaseSchema,
  secrets: secretsSchema,
  search: searchSchema,
  storage: storageSchema,
});

type FormSchema = z.input<typeof formSchema>;

const defaultValues: FormSchema = {
  name: "",
  api: {
    url: "",
    api_key: "",
  },
  database: {
    host: "",
    port: 5432,
    setup_user: {
      username: "",
      password: "",
      secret_name: "postgres/docbox/master",
      use_secret: true,
    },
    root_secret_name: "postgres/docbox/config",
  },
  secrets: {
    provider: SecretsManagerConfigType.Aws,
    memory: {
      secrets: [],
      default: "",
    },
    json: {
      key: "",
      path: "",
    },
  },
  search: {
    provider: SearchIndexFactoryConfigType.Typesense,
    typesense: {
      url: "",
      api_key: {
        use_secret: true,
        api_key: "",
        api_key_secret_name: "typesense/docbox/credentials",
      },
    },
    opensearch: {
      url: "",
    },
  },
  storage: {
    provider: StorageLayerFactoryConfigType.S3,
    endpoint: {
      type: S3EndpointType.Aws,
      custom: {
        endpoint: "",
        access_key_id: "",
        access_key_secret: "",
      },
    },
  },
};

function RouteComponent() {
  const navigate = useNavigate();
  const createServerMutation = useCreateServer();

  const form = useForm({
    defaultValues,
    validators: {
      onChange: formSchema,
    },
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

  const renderApi = (
    <Accordion elevation={2}>
      <AccordionSummary
        expandIcon={<MdiArrowDownDrop width={28} height={28} />}
      >
        <Typography variant="h6">
          <form.Subscribe
            selector={(state) => apiSchema.safeParse(state.values.api).success}
            children={(valid) => <FormValidIndicator valid={valid} />}
          />
          Docbox API
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: "sm" }}
          >
            Credentials for connecting to docbox, these are required to perform
            tenant browsing to allow looking through the boxes, files, links,
            and folders within each tenant.
          </Typography>

          {/* URL */}
          <form.Field
            name="api.url"
            children={(field) => (
              <FormTextField
                field={field}
                required
                variant="outlined"
                size="medium"
                label="Docbox API URL"
                helperText="HTTP URL of the docbox app"
                placeholder="http://example.com:8080"
              />
            )}
          />

          {/* API KEY */}
          <form.Field
            name="api.api_key"
            children={(field) => (
              <FormTextField
                field={field}
                type="password"
                variant="outlined"
                size="medium"
                label="Docbox API Key"
                helperText="API key for accessing docbox if configured on the server. Leave empty if not configured"
              />
            )}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  const renderDatabase = (
    <Accordion elevation={2}>
      <AccordionSummary
        expandIcon={<MdiArrowDownDrop width={28} height={28} />}
      >
        <Typography variant="h6">
          <form.Subscribe
            selector={(state) =>
              databaseSchema.safeParse(state.values.database).success
            }
            children={(valid) => <FormValidIndicator valid={valid} />}
          />
          Database
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <form.Field
            name="database.host"
            children={(field) => (
              <FormTextField
                field={field}
                required
                variant="outlined"
                size="medium"
                label="Database Host"
                helperText="Host of the postgres database"
              />
            )}
          />

          <form.Field
            name="database.port"
            children={(field) => (
              <FormNumberField
                field={field}
                required
                type="number"
                variant="outlined"
                size="medium"
                label="Database Port"
                helperText="Port of the postgres database"
              />
            )}
          />
          <form.Field
            name="database.root_secret_name"
            children={(field) => (
              <FormTextField
                field={field}
                required
                variant="outlined"
                size="medium"
                label="Database Root Secret Name"
                helperText="Name of the secret manager secret that will store the root database credentials"
              />
            )}
          />

          <Stack component={Paper} elevation={4} sx={{ p: 3 }} spacing={3}>
            <Stack>
              <Typography variant="body1">Setup User</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: "sm" }}
              >
                The setup user is a privileged database user that is used for
                setting up docbox databases, running migrations, and querying
                tenants
              </Typography>
            </Stack>

            <form.Field
              name="database.setup_user.use_secret"
              children={(field) => (
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        name={field.name}
                        checked={field.state.value}
                        onChange={(_event, checked) => {
                          field.handleChange(checked);
                        }}
                        onBlur={field.handleBlur}
                      />
                    }
                    label="Use secrets manager"
                  />
                  <FormHelperText>
                    Load the database setup user from a secret manager secret
                  </FormHelperText>
                </FormControl>
              )}
            />

            <form.Subscribe
              selector={(state) => state.values.database.setup_user.use_secret}
              children={(useSecret) =>
                useSecret ? (
                  <>
                    <form.Field
                      name="database.setup_user.secret_name"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          required
                          variant="outlined"
                          size="medium"
                          label="Database Setup User Secret Name"
                          helperText="Secret manager secret name containing the database setup user credentials"
                        />
                      )}
                    />

                    <Alert
                      color="info"
                      icon={<SolarInfoCircleBold fontSize={18} />}
                    >
                      The secret stored in the secret manager must be in the
                      following format:
                      <pre>
                        {JSON.stringify({
                          username: "username",
                          password: "password",
                        })}
                      </pre>
                    </Alert>
                  </>
                ) : (
                  <>
                    <form.Field
                      name="database.setup_user.username"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          required
                          variant="outlined"
                          size="medium"
                          label="Username"
                          helperText="Username for the setup database user"
                        />
                      )}
                    />

                    <form.Field
                      name="database.setup_user.password"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          required
                          type="password"
                          variant="outlined"
                          size="medium"
                          label="Password"
                          helperText="Password for the setup database user"
                        />
                      )}
                    />
                  </>
                )
              }
            />
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  const renderSecrets = (
    <Accordion elevation={2}>
      <AccordionSummary
        expandIcon={<MdiArrowDownDrop width={28} height={28} />}
      >
        <Typography variant="h6">
          <form.Subscribe
            selector={(state) =>
              secretsSchema.safeParse(state.values.secrets).success
            }
            children={(valid) => <FormValidIndicator valid={valid} />}
          />
          Secrets
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <form.Field
            name="secrets.provider"
            children={(field) => (
              <FormControl>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Secrets Provider
                </Typography>

                <ToggleButtonGroup
                  value={field.state.value}
                  onChange={(_event, value) => {
                    field.handleChange(value);
                  }}
                  onBlur={field.handleBlur}
                  exclusive
                >
                  <ToggleButton value={SecretsManagerConfigType.Aws}>
                    AWS
                  </ToggleButton>
                  <ToggleButton value={SecretsManagerConfigType.Json}>
                    Encrypted JSON
                  </ToggleButton>
                  <ToggleButton value={SecretsManagerConfigType.Memory}>
                    Memory
                  </ToggleButton>
                </ToggleButtonGroup>

                <FormHelperText>
                  Select a provider for where secrets should be sourced from and
                  stored in
                </FormHelperText>
              </FormControl>
            )}
          />

          <form.Subscribe
            selector={(state) => state.values.secrets.provider}
            children={(provider) => (
              <>
                {provider === SecretsManagerConfigType.Json && (
                  <>
                    <form.Field
                      name="secrets.json.key"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          required
                          type="password"
                          variant="outlined"
                          size="medium"
                          label="Secrets Encryption Key"
                          helperText="Encryption key / password for encrypting and decrypting the secrets file"
                        />
                      )}
                    />

                    <form.Field
                      name="secrets.json.path"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          required
                          variant="outlined"
                          size="medium"
                          label="Secrets Path"
                          helperText="Path to the secrets json file, the file must be copied for all uses (Manager and docbox itself)"
                        />
                      )}
                    />
                  </>
                )}

                {provider === SecretsManagerConfigType.Memory && (
                  <>
                    {/* TODO: secrets */}

                    <form.Field
                      name="secrets.memory.default"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          variant="outlined"
                          size="medium"
                          label="Default Secret"
                          helperText="Default secret value to provide when one is not found (Optional)"
                        />
                      )}
                    />
                  </>
                )}
              </>
            )}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  const renderSearch = (
    <Accordion elevation={2}>
      <AccordionSummary
        expandIcon={<MdiArrowDownDrop width={28} height={28} />}
      >
        <Typography variant="h6">
          <form.Subscribe
            selector={(state) =>
              searchSchema.safeParse(state.values.search).success
            }
            children={(valid) => <FormValidIndicator valid={valid} />}
          />
          Search
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <form.Field
            name="search.provider"
            children={(field) => (
              <FormControl>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Search Provider
                </Typography>

                <ToggleButtonGroup
                  value={field.state.value}
                  onChange={(_event, value) => {
                    field.handleChange(value);
                  }}
                  onBlur={field.handleBlur}
                  exclusive
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
                </ToggleButtonGroup>

                <FormHelperText>
                  Select a provider that should be used for search index data
                </FormHelperText>
              </FormControl>
            )}
          />

          <form.Subscribe
            selector={(state) => state.values.search.provider}
            children={(provider) => (
              <>
                {provider === SearchIndexFactoryConfigType.Typesense && (
                  <>
                    <form.Field
                      name="search.typesense.url"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          variant="outlined"
                          size="medium"
                          label="URL"
                          helperText="Base URL for the typesense search server"
                        />
                      )}
                    />

                    <form.Field
                      name="search.typesense.api_key.use_secret"
                      children={(field) => (
                        <FormControl>
                          <FormControlLabel
                            control={
                              <Switch
                                name={field.name}
                                checked={field.state.value}
                                onChange={(_event, checked) => {
                                  field.handleChange(checked);
                                }}
                                onBlur={field.handleBlur}
                              />
                            }
                            label="Use secrets manager"
                          />
                          <FormHelperText>
                            Load the typesense API key from from a secret
                            manager secret
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    <form.Subscribe
                      selector={(state) =>
                        state.values.search.typesense.api_key.use_secret
                      }
                      children={(useSecret) =>
                        useSecret ? (
                          <>
                            <form.Field
                              name="search.typesense.api_key.api_key_secret_name"
                              children={(field) => (
                                <FormTextField
                                  field={field}
                                  variant="outlined"
                                  size="medium"
                                  label="API Key Secret Name"
                                  helperText="Secret manager secret name containing the search API key"
                                />
                              )}
                            />

                            <Alert
                              color="info"
                              icon={<SolarInfoCircleBold fontSize={18} />}
                            >
                              The secret stored in the secret manager must be a
                              plain text secret containing the API key
                            </Alert>
                          </>
                        ) : (
                          <>
                            <form.Field
                              name="search.typesense.api_key.api_key"
                              children={(field) => (
                                <FormTextField
                                  field={field}
                                  type="password"
                                  variant="outlined"
                                  size="medium"
                                  label="API Key"
                                  helperText="API key for the search index"
                                />
                              )}
                            />
                          </>
                        )
                      }
                    />
                  </>
                )}

                {provider === SearchIndexFactoryConfigType.OpenSearch && (
                  <>
                    <form.Field
                      name="search.opensearch.url"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          variant="outlined"
                          size="medium"
                          label="URL"
                          helperText="Base URL for the OpenSearch server"
                        />
                      )}
                    />
                  </>
                )}
              </>
            )}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  const renderStorage = (
    <Accordion elevation={2}>
      <AccordionSummary
        expandIcon={<MdiArrowDownDrop width={28} height={28} />}
      >
        <Typography variant="h6">
          <form.Subscribe
            selector={(state) =>
              storageSchema.safeParse(state.values.storage).success
            }
            children={(valid) => <FormValidIndicator valid={valid} />}
          />
          Storage
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <form.Field
            name="storage.provider"
            children={(field) => (
              <FormControl>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Storage Provider
                </Typography>

                <ToggleButtonGroup
                  value={field.state.value}
                  onChange={(_event, value) => {
                    field.handleChange(value);
                  }}
                  onBlur={field.handleBlur}
                  exclusive
                >
                  <ToggleButton value={StorageLayerFactoryConfigType.S3}>
                    S3 Compatible
                  </ToggleButton>
                </ToggleButtonGroup>

                <FormHelperText>
                  Select a provider that should be used for storage
                </FormHelperText>
              </FormControl>
            )}
          />

          <form.Subscribe
            selector={(state) => state.values.storage.provider}
            children={(provider) => (
              <>
                {provider === StorageLayerFactoryConfigType.S3 && (
                  <>
                    <form.Field
                      name="storage.endpoint.type"
                      children={(field) => (
                        <FormControl>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            Storage Endpoint
                          </Typography>

                          <ToggleButtonGroup
                            value={field.state.value}
                            onChange={(_event, value) => {
                              field.handleChange(value);
                            }}
                            onBlur={field.handleBlur}
                            exclusive
                          >
                            <ToggleButton value={S3EndpointType.Aws}>
                              AWS S3
                            </ToggleButton>
                            <ToggleButton value={S3EndpointType.Custom}>
                              S3 Compatible
                            </ToggleButton>
                          </ToggleButtonGroup>

                          <FormHelperText>
                            Select a S3 endpoint that should be used for storage
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    <form.Subscribe
                      selector={(state) => state.values.storage.endpoint.type}
                      children={(provider) => (
                        <>
                          {provider === S3EndpointType.Custom && (
                            <>
                              <form.Field
                                name="storage.endpoint.custom.endpoint"
                                children={(field) => (
                                  <FormTextField
                                    field={field}
                                    variant="outlined"
                                    size="medium"
                                    label="Endpoint"
                                    helperText="URL endpoint for accessing the custom S3"
                                  />
                                )}
                              />

                              <form.Field
                                name="storage.endpoint.custom.access_key_id"
                                children={(field) => (
                                  <FormTextField
                                    field={field}
                                    variant="outlined"
                                    size="medium"
                                    label="Access Key ID"
                                    helperText="Access Key ID for accessing the custom endpoint"
                                  />
                                )}
                              />

                              <form.Field
                                name="storage.endpoint.custom.access_key_secret"
                                children={(field) => (
                                  <FormTextField
                                    field={field}
                                    type="password"
                                    variant="outlined"
                                    size="medium"
                                    label="Access Key Secret"
                                    helperText="Access Key Secret for accessing the custom endpoint"
                                  />
                                )}
                              />
                            </>
                          )}
                        </>
                      )}
                    />
                  </>
                )}
              </>
            )}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

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
              <form.Field
                name="name"
                children={(field) => (
                  <FormTextField
                    field={field}
                    variant="outlined"
                    size="medium"
                    label="Server Name"
                    helperText="Name the docbox server"
                  />
                )}
              />

              {renderApi}
              {renderDatabase}
              {renderSecrets}
              {renderSearch}
              {renderStorage}

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
