
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMe } from '@/hooks/useMe';
import { Loader2 } from 'lucide-react';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, isLoading } = useMe();

  console.log('GuestRoute: isLoading:', isLoading, 'user:', !!user);

  // Aguarda verificação completa
  if (isLoading) {
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

  // Usuário autenticado, redireciona para dashboard
  console.log('GuestRoute: Usuário autenticado, redirecionando para dashboard');
  return <Navigate to="/dashboard" replace />;
};
