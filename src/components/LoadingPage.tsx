import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { ReactElement } from "react";

type Props = {
  message?: string;
  content?: ReactElement;
};

export default function LoadingPage({ message, content }: Props) {
  return (
    <Box
      gap={2}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        flexFlow: "column",
      }}
    >
      <CircularProgress />

      {message && <Typography variant="body2">{message}</Typography>}

      {content}
    </Box>
  );
}
