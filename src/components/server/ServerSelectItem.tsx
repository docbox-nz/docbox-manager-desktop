import { useDeleteServer } from "@/api/server/server.mutations";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import SolarTrashBin2Bold from "~icons/solar/trash-bin-2-bold";

import SolarServer2BoldDuotone from "~icons/solar/server-2-bold-duotone";
import ListItemIcon from "@mui/material/ListItemIcon";

type Props = {
  serverId: string;
  name: string;

  onLoad: VoidFunction;
};

export default function ServerSelectItem({ serverId, name, onLoad }: Props) {
  const { mutate: deleteServer, isPending: isDeleting } =
    useDeleteServer(serverId);

  return (
    <ListItem>
      <ListItemIcon>
        <Box
          component={SolarServer2BoldDuotone}
          sx={{ width: 48, height: 48, mr: 2 }}
        />
      </ListItemIcon>

      <ListItemText primary={name} secondary={serverId} />

      <Stack direction="row" alignItems="center">
        <Button
          onClick={() => {
            onLoad();
          }}
        >
          Connect
        </Button>

        <IconButton onClick={() => deleteServer()} loading={isDeleting}>
          <Box component={SolarTrashBin2Bold} />
        </IconButton>
      </Stack>
    </ListItem>
  );
}
