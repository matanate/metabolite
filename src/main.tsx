import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

import NotFoundPage from "./NotFoundPage";
import Dashboard from "./dashboard/Dashboard";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Failed to find the root element");
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
    errorElement: <NotFoundPage />,
  },
]);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
