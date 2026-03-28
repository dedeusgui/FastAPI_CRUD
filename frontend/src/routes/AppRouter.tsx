import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { FriendsPage } from "../pages/friends/FriendsPage";
import { LandingPage } from "../pages/LandingPage";
import { TasksPage } from "../pages/tasks/TasksPage";
import { RedirectIfAuthenticated } from "./RedirectIfAuthenticated";
import { RequireAuth } from "./RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        path: "/entrar",
        element: <LoginPage />,
      },
      {
        path: "/criar-conta",
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/amigos",
            element: <FriendsPage />,
          },
          {
            path: "/tarefas",
            element: <TasksPage />,
          },
        ],
      },
    ],
  },
]);
