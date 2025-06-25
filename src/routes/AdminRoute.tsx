
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isGlobalAdmin } from '@/services/admin';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsChecking(false);
        return;
      }

      try {
        console.log('AdminRoute: Verificando status de admin para usuário:', user.id);
        const adminStatus = await isGlobalAdmin(user.id);
        console.log('AdminRoute: Status admin:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('AdminRoute: Erro ao verificar status de admin:', error);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  if (authLoading || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Verificando permissões...</div>
      </div>
    );
  }

  // Se não está logado, redireciona para login
  if (!user) {
    console.log('AdminRoute: Usuário não autenticado, redirecionando para login');
    return <Navigate to="/admin/login" replace />;
  }

  // Se não é admin, redireciona para dashboard
  if (!isAdmin) {
    console.log('AdminRoute: Usuário não é admin, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminRoute: Usuário é admin, permitindo acesso');
  return <>{children}</>;
};
