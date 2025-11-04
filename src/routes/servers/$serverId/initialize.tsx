import ServerToolbar from "@/components/ServerToolbar";
import { useServerContext } from "@/context/server-context";
import Stack from "@mui/material/Stack";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId/initialize")({
  component: RouteComponent,
});

function RouteComponent() {
  const server = useServerContext();

  return (
    <Stack>
      <ServerToolbar server={server} />
      <div>
        <h1>Initialize</h1>
        <p>
          The connected <b>Docbox</b> server does not appear to be initialized,
          press the button below to initialize the server.
        </p>
        <button>Initialize</button>
      </div>
    </Stack>
  );
}
