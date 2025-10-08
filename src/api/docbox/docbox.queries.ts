import { useDocboxClient } from "@/components/docbox/DocboxProvider";
import { useQuery } from "@tanstack/react-query";
import { docboxKeys } from "./docbox.keys";
import { isNil } from "@/utils/nullable";
import { AdminDocumentBoxesRequest } from "node_modules/@docbox-nz/docbox-sdk/dist/types/admin";

export function useDocumentBoxes(query: AdminDocumentBoxesRequest) {
  const client = useDocboxClient();

  return useQuery({
    queryKey: docboxKeys.instance(client).boxes.query(query),
    queryFn: () => client.admin.documentBoxes(query),
  });
}

export function useTenantStats() {
  const client = useDocboxClient();

  return useQuery({
    queryKey: docboxKeys.instance(client).admin.stats,
    queryFn: () => client.admin.tenantStats(),
  });
}

export function useDocumentBox(scope: string | null | undefined) {
  const client = useDocboxClient();

  return useQuery({
    enabled: !isNil(scope),
    queryKey: docboxKeys.instance(client).boxes.specific(scope).root,
    queryFn: () => client.documentBox.get(scope!),
  });
}
export function useDocumentBoxStats(scope: string | null | undefined) {
  const client = useDocboxClient();

  return useQuery({
    enabled: !isNil(scope),
    queryKey: docboxKeys.instance(client).boxes.specific(scope).stats,
    queryFn: () => client.documentBox.stats(scope!),
  });
}

export function useFolder(
  scope: string | null | undefined,
  folderId: string | null | undefined,
) {
  const client = useDocboxClient();

  return useQuery({
    enabled: !isNil(scope) && !isNil(folderId),
    queryKey: docboxKeys
      .instance(client)
      .boxes.specific(scope)
      .folder.specific(folderId).root,
    queryFn: () => client.folder.get(scope!, folderId!),
  });
}

export function useFile(
  scope: string | null | undefined,
  fileId: string | null | undefined,
) {
  const client = useDocboxClient();

  return useQuery({
    enabled: !isNil(scope) && !isNil(fileId),
    queryKey: docboxKeys
      .instance(client)
      .boxes.specific(scope)
      .file.specific(fileId).root,
    queryFn: () => client.file.get(scope!, fileId!),
  });
}
