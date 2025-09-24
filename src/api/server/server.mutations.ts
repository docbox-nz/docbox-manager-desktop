import { useMutation } from "@tanstack/react-query";
import { serverKeys } from "./server.keys";
import { createServer, deleteServer, loadServer } from "./server.requests";
import { CreateServer, LoadServerConfig } from "./server.types";
import { queryClient } from "@/integrations/tanstack-query/root-provider";

export function useCreateServer() {
  return useMutation({
    mutationKey: serverKeys.createServer,
    mutationFn: (config: CreateServer) => createServer(config),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: serverKeys.servers });
    },
  });
}

export function useLoadServer() {
  return useMutation({
    mutationKey: serverKeys.createServer,
    mutationFn: ({
      serverId,
      loadConfig,
    }: {
      serverId: string;
      loadConfig: LoadServerConfig;
    }) => loadServer(serverId, loadConfig),
  });
}

export function useDeleteServer(serverId: string) {
  return useMutation({
    mutationKey: serverKeys.removeServer(serverId),
    mutationFn: () => deleteServer(serverId),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: serverKeys.servers });
    },
  });
}
