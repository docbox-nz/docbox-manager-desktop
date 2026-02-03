import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useStore } from "@tanstack/react-form";
import * as z from "zod/v4";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useCreateTenant } from "@/api/tenant/tenant.mutations";
import { getAPIErrorMessage } from "@/api/axios";
import { toast } from "sonner";
import MdiChevronLeft from "~icons/mdi/chevron-left";
import IconButton from "@mui/material/IconButton";
import RouterLink from "@/components/RouterLink";
import { useAppForm } from "@/hooks/use-app-form";
import {
  TenantSection,
  tenantSectionDefaultValues,
  tenantSectionSchema,
} from "@/features/tenants/create/tenant-section";
import {
  DatabaseSection,
  databaseSectionDefaultValues,
  databaseSectionSchema,
} from "@/features/tenants/create/database-section";
import {
  StorageSection,
  storageSectionDefaultValues,
  storageSectionSchema,
} from "@/features/tenants/create/storage-section";
import {
  SearchSection,
  searchSectionDefaultValues,
  searchSectionSchema,
} from "@/features/tenants/create/search-section";
import {
  EventsSection,
  eventsSectionDefaultValues,
  eventsSectionSchema,
} from "@/features/tenants/create/events-section";
import { getTenants } from "@/api/tenant/tenant.requests";
import ServerToolbar from "@/components/ServerToolbar";
import { useServerContext } from "@/context/server-context";
import { v4 } from "uuid";

export const Route = createFileRoute(
  "/servers/$serverId/_initialized/tenant/create",
)({
  component: TenantCreate,
});

export const ENV_TAG: Partial<Record<string, string>> = {
  Development: "dev",
  Production: "prod",
};

const createTenantSchema = z.object({
  tenant: tenantSectionSchema,
  database: databaseSectionSchema,
  storage: storageSectionSchema,
  search: searchSectionSchema,
  events: eventsSectionSchema,
});

const defaultValues: z.input<typeof createTenantSchema> = {
  tenant: tenantSectionDefaultValues,
  database: databaseSectionDefaultValues,
  storage: storageSectionDefaultValues,
  search: searchSectionDefaultValues,
  events: eventsSectionDefaultValues,
};

function createTenantFields(value: z.output<typeof createTenantSchema>) {
  const envTag = ENV_TAG[value.tenant.env] ?? value.tenant.env.toLowerCase();

  const db_name = `docbox-${value.database.db_name}-${envTag}`;
  const db_secret_name = `postgres/docbox/${envTag}/${value.database.db_secret_name}`;
  const db_role_name = `docbox_${value.database.db_role_name}_${envTag}_api`;
  const db_iam_user = value.database.db_iam_user;
  const storage_bucket_name = `docbox-${value.storage.storage_bucket_name}-${envTag}`;
  const search_index_name = `docbox-${value.search.search_index_name}-${envTag}`;
  const event_queue_url =
    value.events.event_queue_url.trim().length > 0
      ? value.events.event_queue_url
      : null;
  const storage_s3_queue_arn =
    value.storage.s3_queue_arn.trim().length > 0
      ? value.storage.s3_queue_arn
      : null;

  const storage_cors_origins = value.storage.storage_cors_origins.filter(
    (value) => value.trim().length > 0,
  );

  return {
    db_name,
    db_secret_name,
    db_iam_user,
    db_role_name,
    storage_bucket_name,
    search_index_name,
    event_queue_url,
    storage_s3_queue_arn,
    storage_cors_origins,
  };
}

function TenantCreate() {
  const { serverId } = Route.useParams();
  const server = useServerContext();

  const createTenantMutation = useCreateTenant(serverId);
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: createTenantSchema,

      // Ensure other tenants don't have the easily identifiable parts
      onSubmitAsync: async ({ value }) => {
        const tenants = await getTenants(serverId);
        const {
          db_name,
          db_secret_name,
          storage_bucket_name,
          search_index_name,
        } = createTenantFields(value);

        // Ensure that none of the resources are in use by another tenant
        for (const tenant of tenants) {
          if (tenant.db_name === db_name) {
            return {
              form: "database name is already in use",
              fields: {
                "database.db_name": "database name is already in use",
              },
            };
          }

          if (tenant.db_secret_name === db_secret_name) {
            return {
              form: "database secret name is already in use",
              fields: {
                "database.db_secret_name":
                  "database secret name is already in use",
              },
            };
          }

          if (tenant.s3_name === storage_bucket_name) {
            return {
              form: "storage bucket name is already in use",
              fields: {
                "storage.storage_bucket_name":
                  "storage bucket name is already in use",
              },
            };
          }

          if (tenant.os_index_name === search_index_name) {
            return {
              form: "search index name is already in use",
              fields: {
                "search.search_index_name":
                  "search index name is already in use",
              },
            };
          }
        }

        return null;
      },
    },
    onSubmit: async ({ value, formApi }) => {
      const {
        db_name,
        db_secret_name,
        db_role_name,
        db_iam_user,
        storage_bucket_name,
        search_index_name,
        event_queue_url,
        storage_s3_queue_arn,
        storage_cors_origins,
      } = createTenantFields(value);

      await createTenantMutation.mutateAsync({
        id: value.tenant.id,
        name: value.tenant.name,
        env: value.tenant.env,
        db_name,
        db_secret_name,
        db_iam_user,
        db_role_name,
        storage_bucket_name,
        storage_s3_queue_arn,
        storage_cors_origins,
        search_index_name,
        event_queue_url,
      });
      toast.success("Created tenant");
      navigate({ to: "/servers/$serverId", params: { serverId } });

      // Reset and rotate ID on submission
      formApi.reset();

      // Update the default values
      tenantSectionDefaultValues.id = v4();
      formApi.setFieldValue("tenant.id", v4());
    },
    listeners: {
      onChange({ formApi, fieldApi }) {
        // React to only changes on the simplified, env, and tag fields
        if (
          !["tenant.simplified", "tenant.env", "tenant.tag"].includes(
            fieldApi.name,
          )
        ) {
          return;
        }

        const simplified = formApi.getFieldValue("tenant.simplified");
        if (!simplified) return;

        // Update all linked fields that are determined by the tag
        const tag = formApi.getFieldValue("tenant.tag");
        formApi.setFieldValue("database.db_name", tag);
        formApi.setFieldValue("database.db_secret_name", tag);
        formApi.setFieldValue("database.db_role_name", tag.replace(/-/g, "_"));
        formApi.setFieldValue("storage.storage_bucket_name", tag);
        formApi.setFieldValue("search.search_index_name", tag);
      },
    },
  });

  const environment = useStore(form.store, (state) => state.values.tenant.env);
  const environmentTag = ENV_TAG[environment] ?? "unknown";

  return (
    <>
      <ServerToolbar server={server} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 24,
        }}
      >
        <Card sx={{ maxWidth: 800, width: 1, my: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center">
                <IconButton
                  size="small"
                  sx={{ mr: 0.5 }}
                  component={RouterLink}
                  to="/servers/$serverId"
                >
                  <MdiChevronLeft width={32} height={32} />
                </IconButton>

                <Typography variant="inherit">Create Tenant</Typography>
              </Stack>
            }
            subheader="Configure the new tenant below"
            slotProps={{
              subheader: {
                mt: 1,
              },
            }}
          />
          <CardContent sx={{ py: 0 }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <Stack spacing={3}>
                <TenantSection form={form} fields="tenant" />

                <Stack>
                  <DatabaseSection
                    form={form}
                    fields="database"
                    environmentTag={environmentTag}
                  />

                  <StorageSection
                    form={form}
                    fields="storage"
                    environmentTag={environmentTag}
                  />

                  <SearchSection
                    form={form}
                    fields="search"
                    environmentTag={environmentTag}
                  />

                  <EventsSection form={form} fields="events" />
                </Stack>

                {createTenantMutation.isError && (
                  <Alert severity="error">
                    Failed to create:{" "}
                    {getAPIErrorMessage(createTenantMutation.error)}
                  </Alert>
                )}

                <form.Subscribe
                  selector={(state) => [state.errorMap]}
                  children={([errorMap]) =>
                    errorMap.onSubmit ? (
                      <Alert severity="error">
                        {errorMap.onSubmit.toString()}
                      </Alert>
                    ) : null
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  loading={createTenantMutation.isPending}
                >
                  Create
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
