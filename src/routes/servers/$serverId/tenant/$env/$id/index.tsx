import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { createFileRoute } from "@tanstack/react-router";
import Divider from "@mui/material/Divider";
import { z } from "zod";
import TenantStats from "@/features/tenant/TenantStats";
import { useServerContext } from "@/context/server-context";
import TenantToolbar from "@/components/TenantToolbar";
import DocumentBoxesView from "@/features/docbox/document-box/DocumentBoxesView";
import { useTenantContext } from "@/context/tenant-context";
import RouterLink from "@/components/RouterLink";
import IconButton from "@mui/material/IconButton";
import MdiChevronLeft from "~icons/mdi/chevron-left";
import Typography from "@mui/material/Typography";

const docboxSchema = z.object({
  deleteScope: z.string().optional(),
});

export const Route = createFileRoute("/servers/$serverId/tenant/$env/$id/")({
  component: RouteComponent,
  validateSearch: docboxSchema,
});

function RouteComponent() {
  const { deleteScope } = Route.useSearch();
  const navigate = Route.useNavigate();

  const server = useServerContext();
  const tenant = useTenantContext();

  const onCloseDeleteScope = () =>
    navigate({
      to: ".",
      search: (search) => ({ ...search, deleteScope: undefined }),
    });

  return (
    <>
      <TenantToolbar server={server} tenant={tenant} />

      <Card sx={{ m: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                size="small"
                component={RouterLink}
                to="/servers/$serverId"
              >
                <MdiChevronLeft width={24} height={24} />
              </IconButton>

              <Typography variant="h5">{tenant.name}</Typography>
            </Stack>

            <TenantStats />
          </Stack>

          <Divider sx={{ mt: 2 }} />

          <DocumentBoxesView
            deleteScope={deleteScope}
            onCloseDeleteScope={onCloseDeleteScope}
          />
        </CardContent>
      </Card>
    </>
  );
}
