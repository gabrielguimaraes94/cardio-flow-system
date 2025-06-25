
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useClinic } from '@/contexts/ClinicContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { selectedClinic, clinics, loading } = useClinic();
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se há clínica selecionada e redireciona se necessário
  useEffect(() => {
    // Não faz nada se ainda está carregando
    if (loading) return;
    
    // Não faz nada se já está na página de seleção de clínica
    if (location.pathname === '/clinic-selection') return;
    
    // Se não tem clínica selecionada e tem múltiplas clínicas, redireciona para seleção
    if (!selectedClinic && clinics.length > 1) {
      console.log('Layout: Nenhuma clínica selecionada com múltiplas disponíveis, redirecionando para seleção');
      navigate('/clinic-selection', { replace: true });
      return;
    }
    
    // Se não tem clínica selecionada e não tem clínicas, redireciona para no-access
    if (!selectedClinic && clinics.length === 0) {
      console.log('Layout: Nenhuma clínica disponível, redirecionando para no-access');
      navigate('/no-access', { replace: true });
      return;
    }
  }, [selectedClinic, clinics, loading, navigate, location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <SidebarInset className="flex flex-col w-full">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
