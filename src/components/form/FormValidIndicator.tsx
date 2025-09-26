import Box from "@mui/material/Box";

import MdiCheckCircle from "~icons/mdi/check-circle";
import MdiError from "~icons/mdi/error";

type Props = {
  valid: boolean;
};

export default function FormValidIndicator({ valid }: Props) {
  return (
    <Box
      component="span"
      sx={{ color: valid ? "success.main" : "error.main", mr: 1 }}
    >
      {valid ? (
        <MdiCheckCircle
          width={22}
          height={22}
          style={{ verticalAlign: "middle" }}
        />
      ) : (
        <MdiError width={22} height={20} style={{ verticalAlign: "middle" }} />
      )}
    </Box>
  );
}
