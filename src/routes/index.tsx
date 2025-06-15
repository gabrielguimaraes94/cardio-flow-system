
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GuestRoute } from './GuestRoute';
import { PrivateRoute } from './PrivateRoute';
import { AdminRoute } from './AdminRoute';

// Guest Routes (não logado)
import Index from '@/pages/Index';

// Clinic Selection Route
import { ClinicSelection } from '@/pages/ClinicSelection';

// Private Routes (logado com clínicas)
import { Dashboard } from '@/pages/Dashboard';
import { AngioplastyCreate } from '@/pages/AngioplastyCreate';
import { AngioplastyList } from '@/pages/AngioplastyList';
import { AngioplastyView } from '@/pages/AngioplastyView';
import Angioplasty from '@/pages/Angioplasty';
import { PatientList } from '@/pages/PatientList';
import { PatientForm } from '@/pages/PatientForm';
import { PatientHistory } from '@/pages/PatientHistory';
import { PatientAnamnesisHistory } from '@/pages/PatientAnamnesisHistory';
import { AnamnesisForm } from '@/pages/AnamnesisForm';
import Catheterization from '@/pages/Catheterization';
import { CatheterizationReport } from '@/pages/CatheterizationReport';
import { CatheterizationReportList } from '@/pages/CatheterizationReportList';
import { CatheterizationTemplateEditor } from '@/pages/CatheterizationTemplateEditor';
import Reports from '@/pages/Reports';
import Schedule from '@/pages/Schedule';
import Settings from '@/pages/Settings';
import AngioplastySearch from '@/pages/AngioplastySearch';

// Insurance Routes
import { InsuranceList } from '@/pages/insurance/InsuranceList';
import { InsuranceForm } from '@/pages/insurance/InsuranceForm';

// Admin Routes
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminLogin } from '@/pages/admin/AdminLogin';

// Special Routes
import NoAccess from '@/pages/NoAccess';
import NotFound from '@/pages/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Guest Routes - apenas para usuários não logados */}
      <Route 
        path="/" 
        element={
          <GuestRoute>
            <Index />
          </GuestRoute>
        } 
      />
      
      <Route 
        path="/admin/login" 
        element={
          <GuestRoute>
            <AdminLogin />
          </GuestRoute>
        } 
      />

      {/* Clinic Selection Route - para usuários logados escolherem clínica */}
      <Route 
        path="/clinic-selection" 
        element={<ClinicSelection />} 
      />

      {/* Private Routes - para usuários logados com clínicas */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />

      {/* Angioplasty Routes */}
      <Route 
        path="/angioplasty" 
        element={
          <PrivateRoute>
            <Angioplasty />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/angioplasty/create" 
        element={
          <PrivateRoute>
            <AngioplastyCreate />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/angioplasty/list" 
        element={
          <PrivateRoute>
            <AngioplastyList />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/angioplasty/view/:id" 
        element={
          <PrivateRoute>
            <AngioplastyView />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/angioplasty/search" 
        element={
          <PrivateRoute>
            <AngioplastySearch />
          </PrivateRoute>
        } 
      />

      {/* Insurance Routes */}
      <Route 
        path="/insurance" 
        element={
          <PrivateRoute>
            <InsuranceList />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/insurance/new" 
        element={
          <PrivateRoute>
            <InsuranceForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/insurance/:id" 
        element={
          <PrivateRoute>
            <InsuranceForm />
          </PrivateRoute>
        } 
      />

      {/* Patient Routes */}
      <Route 
        path="/patients" 
        element={
          <PrivateRoute>
            <PatientList />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/patients/new" 
        element={
          <PrivateRoute>
            <PatientForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/patients/:id/edit" 
        element={
          <PrivateRoute>
            <PatientForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/patients/:id/history" 
        element={
          <PrivateRoute>
            <PatientHistory />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/patients/:id/anamnesis" 
        element={
          <PrivateRoute>
            <PatientAnamnesisHistory />
          </PrivateRoute>
        } 
      />
      {/* Nova rota para criar anamnese de um paciente específico */}
      <Route 
        path="/patients/:patientId/anamnesis/new" 
        element={
          <PrivateRoute>
            <AnamnesisForm />
          </PrivateRoute>
        } 
      />

      {/* Anamnesis Routes */}
      <Route 
        path="/anamnesis" 
        element={
          <PrivateRoute>
            <AnamnesisForm />
          </PrivateRoute>
        } 
      />

      {/* Catheterization Routes */}
      <Route 
        path="/catheterization" 
        element={
          <PrivateRoute>
            <Catheterization />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/catheterization/report" 
        element={
          <PrivateRoute>
            <CatheterizationReport />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/catheterization/reports" 
        element={
          <PrivateRoute>
            <CatheterizationReportList />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/catheterization/template-editor" 
        element={
          <PrivateRoute>
            <CatheterizationTemplateEditor />
          </PrivateRoute>
        } 
      />

      {/* Other Routes */}
      <Route 
        path="/reports" 
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/schedule" 
        element={
          <PrivateRoute>
            <Schedule />
          </PrivateRoute>
        } 
      />
      
      {/* Settings Routes - com sub-rotas */}
      <Route 
        path="/settings" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings/clinics" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings/insurance" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings/tuss" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings/materials" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings/profile" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />

      {/* Admin Routes - apenas para administradores globais */}
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />

      {/* Special Routes - sem guards */}
      <Route path="/no-access" element={<NoAccess />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
