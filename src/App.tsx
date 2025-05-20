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
import { CatheterizationTemplateEditor } from "./pages/CatheterizationTemplateEditor";
import { CatheterizationReportList } from "./pages/CatheterizationReportList";
import { Angioplasty } from "./pages/Angioplasty";
import { Reports } from "./pages/Reports";
import { Schedule } from "./pages/Schedule";
import { InsuranceList } from "./pages/InsuranceList";
import { InsuranceForm } from "./pages/InsuranceForm";
import { InsuranceFormConfig } from "./pages/InsuranceFormConfig";
import { InsuranceAuditRules } from "./pages/InsuranceAuditRules";
import { InsuranceContractList } from "./pages/InsuranceContractList";
import { InsuranceContractForm } from "./pages/InsuranceContractForm";

const routes = [
  { path: "/", element: <Index /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/no-access", element: <NoAccess /> },
  { path: "/patients", element: <PatientList /> },
  { path: "/patient/new", element: <PatientForm /> },
  { path: "/patient/:id/edit", element: <PatientForm /> },
  { path: "/patient/:id/anamnesis", element: <AnamnesisForm /> },
  { path: "/patient/:id/history", element: <PatientAnamnesisHistory /> },
  { path: "/angioplasty", element: <Angioplasty /> },
  { path: "/reports", element: <Reports /> },
  { path: "/schedule", element: <Schedule /> },
  { path: "/catheterization/create", element: <CatheterizationReport /> },
  { path: "/catheterization/list", element: <CatheterizationReportList /> },
  { path: "/catheterization/template-editor", element: <CatheterizationTemplateEditor /> },
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/insurance/list", element: <InsuranceList /> },
  { path: "/insurance/new", element: <InsuranceForm /> },
  { path: "/insurance/:id/edit", element: <InsuranceForm /> },
  { path: "/insurance/form-config", element: <InsuranceFormConfig /> },
  { path: "/insurance/audit-rules", element: <InsuranceAuditRules /> },
  { path: "/insurance/contracts", element: <InsuranceContractList /> },
  { path: "/insurance/contracts/new", element: <InsuranceContractForm /> },
  { path: "/insurance/contracts/:id/edit", element: <InsuranceContractForm /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/settings", element: <Settings /> },
  { path: "/settings/clinics", element: <Settings /> },
  { path: "/settings/insurance", element: <Settings /> },
  { path: "/settings/profile", element: <Settings /> },
  { path: "/settings/tuss", element: <Settings /> },
  { path: "/settings/materials", element: <Settings /> },
  { path: "*", element: <NotFound /> }
];

const router = createBrowserRouter(routes);

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
