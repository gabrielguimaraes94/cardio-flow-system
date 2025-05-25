
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, Heart, FileText, Calendar, Settings, LogOut, Menu, FileUser, BarChart } from 'lucide-react';
import { 
  Sidebar as SidebarComponent,
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Heart },
    { title: "Pacientes", url: "/patients", icon: Users },
    { title: "Cateterismo", url: "/catheterization", icon: FileText },
    { title: "Angioplastia", url: "/angioplasty", icon: FileText },
    { title: "Relatórios", url: "/reports", icon: BarChart },
    { title: "Agenda", url: "/schedule", icon: Calendar },
    { title: "Configurações", url: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado com segurança.",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível desconectar. Tente novamente.",
      });
    }
  };

  return (
    <SidebarComponent variant="sidebar" collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-gray-200/60 bg-gradient-to-r from-cardio-600 to-cardio-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
              <Heart className="h-6 w-6 text-white flex-shrink-0" />
            </div>
            {state === 'expanded' && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">CardioFlow</h1>
                <p className="text-xs text-white/80 truncate">Sistema Médico</p>
              </div>
            )}
          </div>
          <SidebarTrigger className="h-8 w-8 text-white hover:bg-white/20 border-0 flex-shrink-0" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-3 bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url !== '/dashboard' && location.pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={state === 'collapsed' ? item.title : undefined}
                      className={`
                        w-full justify-start h-12 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-cardio-500 to-cardio-600 text-white shadow-lg shadow-cardio-500/25' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-cardio-600'
                        }
                      `}
                    >
                      <Link to={item.url} className="flex items-center gap-4 w-full px-1">
                        <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                        </div>
                        {state === 'expanded' && (
                          <span className="font-medium truncate">{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200/60 p-3 bg-gray-50/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={state === 'collapsed' ? 'Sair' : undefined}
              className="w-full justify-start h-12 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <div className="flex items-center gap-4 w-full px-1">
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                  <LogOut className="h-5 w-5" />
                </div>
                {state === 'expanded' && (
                  <span className="font-medium truncate">Sair</span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
};
