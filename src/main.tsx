import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "sonner";
import "@docbox-nz/docbox-ui/style.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { InitializeGuard } from "./components/InitializeGuard.tsx";
import ServerSelectionProvider from "./components/ServerSelectionProvider.tsx";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProvider.getContext(),
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider theme={darkTheme}>
        <TanStackQueryProvider.Provider>
          <ServerSelectionProvider>
            <InitializeGuard>
              <RouterProvider router={router} />
            </InitializeGuard>
          </ServerSelectionProvider>
        </TanStackQueryProvider.Provider>

        <CssBaseline enableColorScheme />

        <Toaster />
      </ThemeProvider>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
