import { getAPIErrorMessage } from "@/api/axios";
import { useTenantStats } from "@/api/docbox/docbox.queries";
import { fData } from "@/utils/format-number";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";

export default function TenantStats() {
  const { data, isLoading, isError, isSuccess, error } = useTenantStats();

  if (isLoading) {
    return <LinearProgress />;
  }

  if (isError) {
    return getAPIErrorMessage(error);
  }

  if (!isSuccess) {
    return null;
  }

  const stats = data;

  return (
    <Stack direction="row" spacing={1} display="inline-flex" sx={{ ml: 1 }}>
      <Chip label={`Files: ${stats.total_files}`} />
      <Chip label={`Folders: ${stats.total_folders}`} />
      <Chip label={`Links: ${stats.total_links}`} />
      <Chip label={`Total Files Size: ${fData(stats.file_size)}`} />
    </Stack>
  );
}
