
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

  console.log('PrivateRoute: authLoading:', authLoading, 'clinicsLoading:', clinicsLoading, 'userClinics.length:', userClinics.length);

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

  // IMPORTANTE: Aguarda o carregamento das clínicas terminar
  if (clinicsLoading) {
    console.log('PrivateRoute: Aguardando carregamento das clínicas...');
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Carregando clínicas...</div>
      </div>
    );
  }

  // Só verifica se tem clínicas APÓS o carregamento estar completo
  if (userClinics.length === 0) {
    console.log("PrivateRoute: Redirecionando para no-access - usuário sem clínicas");
    return <Navigate to="/no-access" replace />;
  }

  console.log("PrivateRoute: Usuário autenticado com clínicas, permitindo acesso");
  return <>{children}</>;
};
