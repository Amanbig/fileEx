import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/themeProvider";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import TitleBar from "./components/app/titleBar";
import CommandsPallet from "./components/app/commandsPallet";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col h-screen overflow-hidden">
        <TitleBar />
        <CommandsPallet/>
        <div className="flex-1 overflow-hidden">
          <RouterProvider router={router} />
        </div>
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
