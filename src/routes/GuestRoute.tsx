
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStaffClinic } from '@/contexts/StaffClinicContext';
import { Loader2 } from 'lucide-react';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { loading: clinicsLoading } = useStaffClinic();

  console.log('GuestRoute: authLoading:', authLoading, 'user:', !!user, 'clinicsLoading:', clinicsLoading);

  // Aguarda verificação de autenticação
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Verificando autenticação...</div>
      </div>
    );
  }

  // Se não há usuário, mostra a página guest
  if (!user) {
    console.log('GuestRoute: Usuário não autenticado, mostrando página guest');
    return <>{children}</>;
  }

  // Se há usuário, aguarda o carregamento das clínicas antes de redirecionar
  if (clinicsLoading) {
    console.log('GuestRoute: Usuário autenticado, aguardando carregamento das clínicas...');
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Verificando autenticação...</div>
      </div>
    );
  }

  // Usuário autenticado, redireciona para dashboard
  console.log('GuestRoute: Usuário autenticado, redirecionando para dashboard');
  return <Navigate to="/dashboard" replace />;
};
