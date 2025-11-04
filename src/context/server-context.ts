import { Server } from "@/api/server/server.types";
import { createContext, useContext } from "react";

export const ServerContext = createContext<Server>(null!);

export function useServerContext() {
  return useContext(ServerContext);
}
