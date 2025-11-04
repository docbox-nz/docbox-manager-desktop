import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";

import type { QueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import LoadingPage from "@/components/LoadingPage.tsx";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Suspense fallback={<LoadingPage />}>
        <Outlet />
      </Suspense>

      <TanStackRouterDevtools />
      <TanStackQueryLayout />
    </>
  ),
});
