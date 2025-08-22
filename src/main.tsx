import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/themeProvider";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import TitleBar from "./components/app/titleBar";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TitleBar />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
