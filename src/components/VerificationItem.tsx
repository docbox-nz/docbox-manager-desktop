import { VerifyOutcome } from "@/api/server/server.types";
import CircularProgress from "@mui/material/CircularProgress";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { Box } from "@mui/system";
import MdiSuccessCircle from "~icons/mdi/success-circle";
import MdiError from "~icons/mdi/error";
import Typography from "@mui/material/Typography";
import MdiSkipNextCircle from "~icons/mdi/skip-next-circle";
import Stack from "@mui/material/Stack";

type Props = {
  name: string;
  description: string;
  outcome: VerifyOutcome;
  complete: boolean;
};

export default function VerificationItem({
  name,
  description,
  outcome,
  complete,
}: Props) {
  return (
    <ListItem>
      <ListItemAvatar>
        {outcome.type === "Pending" && (
          <>
            {complete ? (
              <Tooltip title="Skipped due to failure">
                <Box
                  component={MdiSkipNextCircle}
                  sx={{ width: 24, height: 24 }}
                  color="warning.main"
                />
              </Tooltip>
            ) : (
              <Tooltip title="Pending...">
                <CircularProgress size={24} />
              </Tooltip>
            )}
          </>
        )}
        {outcome.type === "Skipped" && (
          <Tooltip title="Skipped">
            <Box
              component={MdiSkipNextCircle}
              color="secondary.main"
              sx={{ width: 24, height: 24 }}
            />
          </Tooltip>
        )}
        {outcome.type === "Success" && (
          <Tooltip title="Success">
            <Box
              component={MdiSuccessCircle}
              color="success.main"
              sx={{ width: 24, height: 24 }}
            />
          </Tooltip>
        )}
        {outcome.type === "Failure" && (
          <Tooltip title="Failure">
            <Box
              component={MdiError}
              color="error.main"
              sx={{ width: 24, height: 24 }}
            />
          </Tooltip>
        )}
      </ListItemAvatar>

      <Stack>
        <ListItemText primary={name} secondary={description} />

        {outcome.type === "Pending" && complete && (
          <Typography color="warning" variant="caption">
            Skipped due to previous failure
          </Typography>
        )}

        {outcome.type === "Skipped" && (
          <Typography color="secondary" variant="caption">
            Skipped, not available for the chosen settings
          </Typography>
        )}

        {outcome.type === "Failure" && (
          <Typography color="error" variant="caption">
            <b>Verification Failed</b>: {outcome.message}
          </Typography>
        )}
      </Stack>
    </ListItem>
  );
}
