
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
import NotFound from "./pages/NotFound";

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
