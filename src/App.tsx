
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginForm } from "./components/auth/LoginForm";
import { Dashboard } from "./pages/Dashboard";
import { PatientList } from "./pages/PatientList";
import { PatientForm } from "./pages/PatientForm";
import { AnamnesisForm } from "./pages/AnamnesisForm";
import { CatheterizationReportList } from "./pages/CatheterizationReportList";
import { CatheterizationTemplateEditor } from "./pages/CatheterizationTemplateEditor";
import { CatheterizationReport } from "./pages/CatheterizationReport";
import { Angioplasty } from "./pages/Angioplasty";
import { Reports } from "./pages/Reports";
import { InsuranceList } from "./pages/insurance/InsuranceList";
import { InsuranceForm } from "./pages/insurance/InsuranceForm";
import { InsuranceContractList } from "./pages/insurance/InsuranceContractList";
import { InsuranceContractForm } from "./pages/insurance/InsuranceContractForm";
import { InsuranceFormConfig } from "./pages/insurance/InsuranceFormConfig";
import { InsuranceAuditRules } from "./pages/insurance/InsuranceAuditRules";
import NotFound from "./pages/NotFound";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/:id/anamnesis" element={<AnamnesisForm />} />
          <Route path="/catheterization" element={<CatheterizationReportList />} />
          <Route path="/catheterization/templates" element={<CatheterizationTemplateEditor />} />
          <Route path="/catheterization/report/:id?" element={<CatheterizationReport />} />
          <Route path="/angioplasty" element={<Angioplasty />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/schedule" element={<Schedule />} />
          
          {/* Settings Routes */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/clinics" element={<Settings />} />
          <Route path="/settings/profile" element={<Settings />} />
          <Route path="/settings/insurance" element={<Settings />} />
          <Route path="/settings/insurance/new" element={<InsuranceForm />} />
          <Route path="/settings/insurance/:id" element={<InsuranceForm />} />
          <Route path="/settings/insurance/:id/forms" element={<InsuranceFormConfig />} />
          <Route path="/settings/insurance/:id/audit-rules" element={<InsuranceAuditRules />} />
          
          {/* Mantendo as rotas antigas para compatibilidade, mas redirecionando */}
          <Route path="/insurance" element={<Settings />} />
          <Route path="/insurance/new" element={<InsuranceForm />} />
          <Route path="/insurance/:id" element={<InsuranceForm />} />
          <Route path="/insurance/:id/contracts" element={<InsuranceContractList />} />
          <Route path="/insurance/:id/contracts/new" element={<InsuranceContractForm />} />
          <Route path="/insurance/:id/contracts/:contractId" element={<InsuranceContractForm />} />
          <Route path="/insurance/:id/forms" element={<InsuranceFormConfig />} />
          <Route path="/insurance/:id/audit-rules" element={<InsuranceAuditRules />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
