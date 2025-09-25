import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SolarLinkBrokenBold from "~icons/solar/link-broken-bold";

type Props = {
  title?: string;
  error: string;
  children?: React.ReactNode;
};

export default function ErrorPage({ title, error, children }: Props) {
  return (
    <Box
      gap={2}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexFlow: "column",
        height: "100vh",
      }}
    >
      <Box component={SolarLinkBrokenBold} width={64} height={64} />
      <Typography variant="h5">{title ?? "Error occurred"}</Typography>
      <Typography color="error" whiteSpace="pre-wrap">
        {error}
      </Typography>

      {children}
    </Box>
  );
}
