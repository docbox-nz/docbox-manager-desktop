import RouterLink from "@/components/RouterLink";
import TenantFileBrowser from "@/components/TenantFileBrowser";
import TenantToolbar from "@/components/TenantToolbar";
import { useServerContext } from "@/context/server-context";
import { useTenantContext } from "@/context/tenant-context";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import MdiChevronLeft from "~icons/mdi/chevron-left";

const docboxSchema = z.object({
  folder: z.string().optional(),

  preview: z.string().optional(),
  edit: z.string().optional(),
  delete: z.string().optional(),
});

export const Route = createFileRoute(
  "/servers/$serverId/tenant/$env/$id/$scope/",
)({
  component: RouteComponent,
  validateSearch: docboxSchema,
});

function RouteComponent() {
  const { scope } = Route.useParams();
  const { folder, preview, edit, delete: deleteId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const server = useServerContext();
  const tenant = useTenantContext();

  const onClosePreview = () =>
    navigate({
      to: ".",
      search: (search) => ({ ...search, preview: undefined }),
    });

  const onCloseEdit = () =>
    navigate({
      to: ".",
      search: (search) => ({ ...search, edit: undefined }),
    });

  const onCloseDelete = () =>
    navigate({
      to: ".",
      search: (search) => ({ ...search, delete: undefined }),
    });

  return (
    <>
      <TenantToolbar server={server} tenant={tenant} />

      <Card sx={{ m: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              size="small"
              component={RouterLink}
              to="/servers/$serverId/tenant/$env/$id"
            >
              <MdiChevronLeft width={24} height={24} />
            </IconButton>

            <Typography variant="h5">{scope}</Typography>
          </Stack>

          <TenantFileBrowser
            scope={scope}
            folder_id={folder}
            preview_id={preview}
            edit_id={edit}
            delete_id={deleteId}
            onClosePreview={onClosePreview}
            onCloseEdit={onCloseEdit}
            onCloseDelete={onCloseDelete}
          />
        </CardContent>
      </Card>
    </>
  );
}
