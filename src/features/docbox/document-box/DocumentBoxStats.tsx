import { getAPIErrorMessage } from "@/api/axios";
import { useDocumentBoxStats } from "@/api/docbox/docbox.queries";
import { fData } from "@/utils/format-number";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";

type Props = {
  scope: string;
};

export default function DocumentBoxStats({ scope }: Props) {
  const { data, isLoading, isError, isSuccess, error } =
    useDocumentBoxStats(scope);

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
    <Stack direction="row" spacing={1}>
      <Chip label={`Files: ${stats.total_files}`} />
      <Chip label={`Folders: ${stats.total_folders}`} />
      <Chip label={`Links: ${stats.total_links}`} />
      <Chip label={` Total Files Size: ${fData((stats as any).file_size)}`} />
    </Stack>
  );
}
