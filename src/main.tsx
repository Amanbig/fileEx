import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/themeProvider";
import { AppSettingsProvider } from "./hooks/useAppSettings";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import TitleBar from "./components/app/titleBar";
import ErrorBoundary from "./components/errorBoundary";
import { getCurrentWindow } from "@tauri-apps/api/window";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

function WindowLayout() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    try {
      const appWindow = getCurrentWindow();
      const checkMax = async () => {
        try {
          const max = await appWindow.isMaximized();
          setIsMaximized(max);
        } catch {}
      };
      checkMax();

      appWindow.onResized(() => {
        checkMax();
      }).then((cleanup) => {
        unlisten = cleanup;
      }).catch(() => {});
    } catch {}

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <div
      className={`flex flex-col h-screen overflow-hidden bg-background text-foreground transition-[border,box-shadow] duration-200 ${
        isMaximized
          ? "border-none shadow-none ring-0"
          : "border border-border/80 dark:border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.85)] ring-1 ring-black/5 dark:ring-white/5"
      }`}
    >
      <TitleBar />
      <div className="flex-1 overflow-hidden">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppSettingsProvider>
          <WindowLayout />
        </AppSettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
