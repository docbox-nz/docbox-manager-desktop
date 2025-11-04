import { getAPIErrorMessage } from "@/api/axios";
import { useDeleteTenant } from "@/api/tenant/tenant.mutations";
import { Tenant } from "@/api/tenant/tenant.types";
import { useAppForm } from "@/hooks/use-app-form";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod/v4";

type Props = {
  open: boolean;
  onClose: VoidFunction;

  serverId: string;
  tenant: Tenant;
};

const deleteTenantSchema = z.object({
  deleteContents: z.boolean(),
  deleteStorage: z.boolean(),
  deleteSearch: z.boolean(),
  deleteDatabase: z.boolean(),
});

const deleteTenantDefaultValues: z.input<typeof deleteTenantSchema> = {
  deleteContents: true,
  deleteStorage: true,
  deleteSearch: true,
  deleteDatabase: true,
};

export default function DeleteTenantDialog({
  open,
  onClose,
  serverId,
  tenant,
}: Props) {
  const deleteTenant = useDeleteTenant(serverId);

  const form = useAppForm({
    defaultValues: deleteTenantDefaultValues,
    validators: {
      onChange: deleteTenantSchema,
    },
    onSubmit: async ({ value }) => {
      await deleteTenant.mutateAsync({
        env: tenant.env,
        tenantId: tenant.id,
        config: {
          delete_contents: value.deleteContents,
          delete_storage: value.deleteStorage,
          delete_search: value.deleteSearch,
          delete_database: value.deleteDatabase,
        },
      });

      onCloseReset();
      toast.success("Deleted tenant");
    },
  });

  const onCloseReset = () => {
    onClose();
    form.reset();
  };

  const deleteContents = useStore(
    form.store,
    (form) => form.values.deleteContents,
  );

  return (
    <Dialog open={open} onClose={onCloseReset}>
      <DialogTitle>Delete Tenant</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete the{" "}
          <b>
            &quot;{tenant.name}&quot; ({tenant.env})
          </b>{" "}
          tenant?
        </Typography>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <Stack spacing={3} sx={{ pt: 2 }}>
            <form.AppField
              name="deleteContents"
              listeners={{
                onChange: (value) => {
                  // Update the associated fields to match
                  form.setFieldValue("deleteDatabase", value.value);
                  form.setFieldValue("deleteSearch", value.value);
                  form.setFieldValue("deleteStorage", value.value);
                },
              }}
              children={(field) => (
                <field.Switch
                  label="Delete Contents"
                  helperText="Delete all stored data for this tenant, may take some time if the tenant has a large number of files"
                />
              )}
            />

            <form.AppField
              name="deleteStorage"
              children={(field) => (
                <field.Switch
                  label="Delete Storage Bucket"
                  helperText="Delete the attached tenant storage bucket after emptying (Requires: Delete Contents)"
                  disabled={!deleteContents}
                />
              )}
            />

            <form.AppField
              name="deleteSearch"
              children={(field) => (
                <field.Switch
                  label="Delete Search Index"
                  helperText="Delete the attached tenant search index after emptying (Requires: Delete Contents)"
                  disabled={!deleteContents}
                />
              )}
            />

            <form.AppField
              name="deleteDatabase"
              children={(field) => (
                <field.Switch
                  label="Delete Database"
                  helperText="Delete the attached tenant database role, secret, and database (Requires: Delete Contents)"
                  disabled={!deleteContents}
                />
              )}
            />

            {deleteTenant.isError && (
              <Alert severity="error">
                Failed to save: {getAPIErrorMessage(deleteTenant.error)}
              </Alert>
            )}

            <DialogActions>
              <Button type="button" variant="outlined" onClick={onCloseReset}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="error"
                variant="contained"
                loading={deleteTenant.isPending}
              >
                Delete
              </Button>
            </DialogActions>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
