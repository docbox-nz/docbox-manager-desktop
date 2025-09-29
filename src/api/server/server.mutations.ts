import { useMutation } from "@tanstack/react-query";
import { serverKeys } from "./server.keys";
import {
  createServer,
  deleteServer,
  loadServer,
  verifyServerStorage,
} from "./server.requests";
import {
  CreateServer,
  LoadServerConfig,
  StorageVerifyOutcome,
} from "./server.types";
import { queryClient } from "@/integrations/tanstack-query/root-provider";
import { Channel } from "@tauri-apps/api/core";

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
    onSuccess(_data, { serverId }) {
      queryClient.invalidateQueries({
        queryKey: serverKeys.server.root(serverId),
      });
    },
  });
}

export function useDeleteServer(serverId: string) {
  return useMutation({
    mutationKey: serverKeys.server.remove(serverId),
    mutationFn: () => deleteServer(serverId),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: serverKeys.servers });
    },
  });
}

export function useVerifyServerStorage(serverId: string) {
  return useMutation({
    mutationKey: serverKeys.server.verifyStorage(serverId),
    mutationFn: ({ onEvent }: { onEvent: Channel<StorageVerifyOutcome> }) =>
      verifyServerStorage(serverId, onEvent),
  });
}
