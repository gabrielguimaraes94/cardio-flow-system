
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMe } from '@/hooks/useMe';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, userClinics, isLoading } = useMe();

  console.log('PrivateRoute: isLoading:', isLoading, 'user:', !!user, 'userClinics.length:', userClinics.length);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Carregando...</div>
      </div>
    );
  }

  // Se não está logado, redireciona para login
  if (!user) {
    console.log("PrivateRoute: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/" replace />;
  }

  // Só verifica se tem clínicas APÓS o carregamento estar completo
  if (userClinics.length === 0) {
    console.log("PrivateRoute: Redirecionando para no-access - usuário sem clínicas");
    return <Navigate to="/no-access" replace />;
  }

  console.log("PrivateRoute: Usuário autenticado com clínicas, permitindo acesso");
  return <>{children}</>;
};
