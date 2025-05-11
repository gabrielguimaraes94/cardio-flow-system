import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ClinicProvider } from "./contexts/ClinicContext";

const queryClient = new QueryClient();

{/* Componente de proteção de rotas */}
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginForm />} />
      
      {/* Rotas protegidas */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/patients" element={<PrivateRoute><PatientList /></PrivateRoute>} />
      <Route path="/patients/new" element={<PrivateRoute><PatientForm /></PrivateRoute>} />
      <Route path="/patients/:id/anamnesis" element={<PrivateRoute><AnamnesisForm /></PrivateRoute>} />
      <Route path="/catheterization" element={<PrivateRoute><CatheterizationReportList /></PrivateRoute>} />
      <Route path="/catheterization/templates" element={<PrivateRoute><CatheterizationTemplateEditor /></PrivateRoute>} />
      <Route path="/catheterization/report/:id?" element={<PrivateRoute><CatheterizationReport /></PrivateRoute>} />
      <Route path="/angioplasty" element={<PrivateRoute><Angioplasty /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
      
      {/* Settings Routes */}
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/settings/clinics" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/settings/profile" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/settings/insurance" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/settings/insurance/new" element={<PrivateRoute><InsuranceForm /></PrivateRoute>} />
      <Route path="/settings/insurance/:id" element={<PrivateRoute><InsuranceForm /></PrivateRoute>} />
      <Route path="/settings/insurance/:id/forms" element={<PrivateRoute><InsuranceFormConfig /></PrivateRoute>} />
      <Route path="/settings/insurance/:id/audit-rules" element={<PrivateRoute><InsuranceAuditRules /></PrivateRoute>} />
      
      {/* Mantendo as rotas antigas para compatibilidade, mas redirecionando */}
      <Route path="/insurance" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/insurance/new" element={<PrivateRoute><InsuranceForm /></PrivateRoute>} />
      <Route path="/insurance/:id" element={<PrivateRoute><InsuranceForm /></PrivateRoute>} />
      <Route path="/insurance/:id/contracts" element={<PrivateRoute><InsuranceContractList /></PrivateRoute>} />
      <Route path="/insurance/:id/contracts/new" element={<PrivateRoute><InsuranceContractForm /></PrivateRoute>} />
      <Route path="/insurance/:id/contracts/:contractId" element={<PrivateRoute><InsuranceContractForm /></PrivateRoute>} />
      <Route path="/insurance/:id/forms" element={<PrivateRoute><InsuranceFormConfig /></PrivateRoute>} />
      <Route path="/insurance/:id/audit-rules" element={<PrivateRoute><InsuranceAuditRules /></PrivateRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ClinicProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ClinicProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;