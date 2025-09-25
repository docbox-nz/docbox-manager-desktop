import type { PropsWithChildren } from "react";
import { useInitialized } from "@/api/root/root.queries";
import LoadingPage from "./LoadingPage";
import InitializePage from "./InitializePage";
import { getAPIErrorMessage } from "@/api/axios";

type Props = {
  serverId: string;
};

export function InitializeGuard({
  serverId,
  children,
}: PropsWithChildren<Props>) {
  const { data, isError, isLoading, error } = useInitialized(serverId);

  if (isError) {
    return getAPIErrorMessage(error);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  const initialized = data ?? false;
  if (!initialized) {
    return <InitializePage serverId={serverId} />;
  }

  return children;
}
