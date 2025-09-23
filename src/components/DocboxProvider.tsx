import { DocboxClient } from "@docbox-nz/docbox-sdk";
import axios from "axios";
import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

interface DocboxContextType {
  baseURL: string;
  client: DocboxClient;
}

export type DocboxClientExt = DocboxClient & {
  __unique_tenant_key: string;
};

const DocboxContext = createContext<DocboxContextType>(null!);

export function useDocboxClient() {
  const context = useContext(DocboxContext);
  return context.client;
}

export function useDocboxEndpoint() {
  const context = useContext(DocboxContext);
  return (endpoint: string) => {
    return `${context.baseURL}/${endpoint}`;
  };
}

type Props = PropsWithChildren<{
  serverId: string;
  env: string;
  tenantId: string;
}>;

export default function DocboxProvider({
  serverId,
  env,
  tenantId,
  children,
}: Props) {
  const value: DocboxContextType = useMemo(() => {
    const baseURL = `http://docbox.localhost/${serverId}/${tenantId}/${env}`; // TODO: NEed to load this dynamically to handle the platform variants
    const axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const docbox = new DocboxClient(axiosInstance);
    const client = Object.assign(docbox, {
      __unique_tenant_key: `${env}-${tenantId}`,
    });

    return { baseURL, client };
  }, [env, tenantId]);

  return (
    <DocboxContext.Provider value={value}>{children}</DocboxContext.Provider>
  );
}
