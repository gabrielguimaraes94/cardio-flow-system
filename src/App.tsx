
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
import { PatientProvider } from "@/contexts/PatientContext";
import NoAccess from "./pages/NoAccess";
import NotFound from "./pages/NotFound";
import { PatientList } from "./pages/PatientList";
import { PatientForm } from "./pages/PatientForm";
import { PatientHistory } from "./pages/PatientHistory";
import { AnamnesisForm } from "./pages/AnamnesisForm";
import { Catheterization } from "./pages/Catheterization";
import { CatheterizationReport } from "./pages/CatheterizationReport";
import { CatheterizationTemplateEditor } from "./pages/CatheterizationTemplateEditor";
import { CatheterizationReportList } from "./pages/CatheterizationReportList";
import { Angioplasty } from "./pages/Angioplasty";
import { Reports } from "./pages/Reports";
import { Schedule } from "./pages/Schedule";
import { InsuranceList } from "./pages/insurance/InsuranceList";
import { InsuranceForm } from "./pages/insurance/InsuranceForm";
import { InsuranceFormConfig } from "./pages/insurance/InsuranceFormConfig";
import { InsuranceAuditRules } from "./pages/insurance/InsuranceAuditRules";
import { InsuranceContractList } from "./pages/insurance/InsuranceContractList";
import { InsuranceContractForm } from "./pages/insurance/InsuranceContractForm";

const routes = [
  { path: "/", element: <Index /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/no-access", element: <NoAccess /> },
  { path: "/patients", element: <PatientList /> },
  { path: "/patients/new", element: <PatientForm /> },
  { path: "/patients/:id/edit", element: <PatientForm /> },
  { path: "/patients/:id/anamnesis", element: <AnamnesisForm /> },
  { path: "/patients/:id/anamnesis/new", element: <AnamnesisForm /> },
  { path: "/patients/:id/anamnesis/:anamnesisId", element: <AnamnesisForm /> },
  { path: "/patients/:patientId/history", element: <PatientHistory /> },
  { path: "/anamnesis", element: <AnamnesisForm /> },
  { path: "/catheterization", element: <Catheterization /> },
  { path: "/catheterization/create", element: <CatheterizationReport /> },
  { path: "/catheterization/list", element: <CatheterizationReportList /> },
  { path: "/catheterization/template-editor", element: <CatheterizationTemplateEditor /> },
  { path: "/angioplasty", element: <Angioplasty /> },
  { path: "/reports", element: <Reports /> },
  { path: "/schedule", element: <Schedule /> },
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
          <PatientProvider>
            <RouterProvider router={router} />
          </PatientProvider>
        </StaffClinicProvider>
      </ClinicProvider>
    </AuthProvider>
  );
}

export default App;
