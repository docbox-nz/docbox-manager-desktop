import RouterLink from "@/components/RouterLink";
import { DocFolder, FolderPathSegment } from "@docbox-nz/docbox-sdk";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";

type Props = {
  scope: string;

  activeFolder?: DocFolder;
  path?: FolderPathSegment[];
};

export default function DocboxFolderBreadcrumbs({
  scope,
  activeFolder,
  path,
}: Props) {
  return (
    <Stack>
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          underline="hover"
          component={RouterLink}
          to="."
          search={(search: object) => ({ ...search, folder: undefined })}
          color="inherit"
        >
          {scope}
        </Link>

        {path &&
          path.map((path, index) => {
            if (index === 0) {
              return null;
            }

            return (
              <Link
                key={path.id}
                underline="hover"
                component={RouterLink}
                to="."
                search={(search: object) => ({
                  ...search,
                  folder: path.id,
                })}
                color="inherit"
              >
                {path.name}
              </Link>
            );
          })}

        {activeFolder && activeFolder.folder_id !== null && (
          <Link
            underline="hover"
            component={RouterLink}
            to="."
            search={(search: object) => search}
            color="text.primary"
          >
            {activeFolder.name}
          </Link>
        )}
      </Breadcrumbs>
    </Stack>
  );
}
