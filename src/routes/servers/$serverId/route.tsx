import { InitializeGuard } from "@/components/InitializeGuard";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();

  return (
    <InitializeGuard serverId={serverId}>
      <Outlet />
    </InitializeGuard>
  );
}
