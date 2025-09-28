import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId/encrypted")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/servers/$serverId/encrypted"!</div>;
}
