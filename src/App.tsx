
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { StaffClinicProvider } from '@/contexts/StaffClinicContext';
import { ClinicProvider } from '@/contexts/ClinicContext';
import { PatientProvider } from '@/contexts/PatientContext';
import { AppRoutes } from '@/routes';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StaffClinicProvider>
            <ClinicProvider>
              <PatientProvider>
                <Toaster />
                <AppRoutes />
              </PatientProvider>
            </ClinicProvider>
          </StaffClinicProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
