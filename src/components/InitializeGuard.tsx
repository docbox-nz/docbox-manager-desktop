import type { PropsWithChildren } from "react";
import { useInitialized } from "@/api/root/root.queries";
import LoadingPage from "./LoadingPage";
import InitializePage from "./InitializePage";
import { useServerContext } from "@/context/server-context";
import { getAPIErrorMessage } from "@/api/axios";

export function InitializeGuard({ children }: PropsWithChildren<{}>) {
  const server = useServerContext();

  const { data, isError, isLoading, error } = useInitialized(server.id);

  if (isError) {
    return getAPIErrorMessage(error);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  const initialized = data ?? false;
  if (!initialized) {
    return <InitializePage serverId={server.id} />;
  }

  return children;
}
