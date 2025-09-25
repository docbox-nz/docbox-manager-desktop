import { useResponsiveDown } from "@/hooks/use-responsive";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import ChevronLeft from "~icons/lucide/chevron-left";
import Download from "~icons/lucide/download";
import Info from "~icons/lucide/info";

type Props = {
  open: boolean;
  onClose: VoidFunction;

  fileName?: string;
  previewURL: string;
  downloadURL: string;

  generated?: boolean;
};

export default function PdfFilePreviewDialog({
  open,
  onClose,
  fileName,
  previewURL,
  downloadURL,
  generated,
}: Props) {
  const isMobile = useResponsiveDown("md");

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle>
        {isMobile ? (
          <Stack
            direction="row"
            alignItems="center"
            sx={{ width: 1, position: "relative", overflow: "hidden" }}
            spacing={1}
          >
            {/* Close button */}
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ minWidth: 0, flexShrink: 0 }}
            >
              <Box component={ChevronLeft} width={20} height={20} />
            </Button>

            {fileName && (
              <Typography
                variant="subtitle1"
                sx={{
                  flex: "auto",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {fileName}
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Grid container alignItems="center">
              <Grid size={{ xs: 4 }} sx={{ overflow: "hidden" }}>
                <Stack
                  spacing={1}
                  direction="row"
                  alignItems="center"
                  sx={{ overflow: "hidden" }}
                >
                  {fileName && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {fileName}
                    </Typography>
                  )}

                  {generated && (
                    <Tooltip title="This preview was generated from another file format, it may differ from the actual file">
                      <Box component={Info} width={24} color="info.main" />
                    </Tooltip>
                  )}
                </Stack>
              </Grid>
              <Grid size={{ xs: 4 }}></Grid>
              <Grid size={{ xs: 4 }}>
                <Stack
                  spacing={2}
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                >
                  {downloadURL && (
                    <Button
                      variant="outlined"
                      href={downloadURL}
                      color="inherit"
                      sx={{ minWidth: 0 }}
                      download="test.jpg"
                    >
                      <Box component={Download} width={20} height={20} />
                    </Button>
                  )}

                  <Button variant="outlined" color="inherit" onClick={onClose}>
                    Close
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        )}
      </DialogTitle>

      <DialogContent
        sx={{
          position: "relative",
          p: 0,
          m: 0,
          width: 1,
          height: "75vh",
          overflow: "hidden",
        }}
      >
        <Box
          component="iframe"
          title="File Preview"
          src={`/pdfjs/web/viewer.html?file=${previewURL}`}
          frameBorder={0}
          sx={{ width: 1, height: 1, display: "block" }}
        />
      </DialogContent>
    </Dialog>
  );
}
