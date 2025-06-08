
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStaffClinic } from '@/contexts/StaffClinicContext';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { loading: clinicsLoading, userClinics } = useStaffClinic();

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Verificando autenticação...</div>
      </div>
    );
  }

  // Se não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (clinicsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Carregando clínicas...</div>
      </div>
    );
  }

  // IMPORTANTE: Só redireciona para no-access se realmente não há clínicas
  // E se o carregamento foi concluído
  if (!clinicsLoading && userClinics.length === 0) {
    console.log("PrivateRoute: Redirecionando para no-access - usuário sem clínicas");
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
};
