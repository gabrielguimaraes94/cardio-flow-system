
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
import { PatientList } from "./pages/PatientList";
import { PatientForm } from "./pages/PatientForm";
import { PatientAnamnesisHistory } from "./pages/PatientAnamnesisHistory";
import { AnamnesisForm } from "./pages/AnamnesisForm";
import { CatheterizationReport } from "./pages/CatheterizationReport";
import { Angioplasty } from "./pages/Angioplasty";
import { Reports } from "./pages/Reports";
import { Schedule } from "./pages/Schedule";

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
    path: "/patients",
    element: <PatientList />,
  },
  {
    path: "/patients/new",
    element: <PatientForm />,
  },
  {
    path: "/patients/:patientId/edit",
    element: <PatientForm />,
  },
  {
    path: "/patients/:patientId/anamnesis",
    element: <PatientAnamnesisHistory />,
  },
  {
    path: "/patients/:patientId/anamnesis/new",
    element: <AnamnesisForm />,
  },
  {
    path: "/patients/:patientId/anamnesis/:anamnesisId",
    element: <AnamnesisForm />,
  },
  {
    path: "/catheterization",
    element: <CatheterizationReport />,
  },
  {
    path: "/angioplasty",
    element: <Angioplasty />,
  },
  {
    path: "/reports",
    element: <Reports />,
  },
  {
    path: "/schedule",
    element: <Schedule />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/settings/clinics",
    element: <Settings />,
  },
  {
    path: "/settings/insurance",
    element: <Settings />,
  },
  {
    path: "/settings/profile",
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
      <ClinicProvider>
        <StaffClinicProvider>
          <RouterProvider router={router} />
        </StaffClinicProvider>
      </ClinicProvider>
    </AuthProvider>
  );
}

export default App;
