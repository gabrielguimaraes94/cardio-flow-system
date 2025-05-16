
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import Settings from "./pages/Settings";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClinicProvider } from "@/contexts/ClinicContext";
import { StaffClinicProvider } from "@/contexts/StaffClinicContext";
import NoAccess from "./pages/NoAccess";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "/no-access",
    element: <NoAccess />
  },
  {
    path: "*",
    element: <NotFound />
  },
]);

function App() {
  return (
    <AuthProvider>
      <StaffClinicProvider>
        <ClinicProvider>
          <RouterProvider router={router} />
        </ClinicProvider>
      </StaffClinicProvider>
    </AuthProvider>
  );
}

export default App;
