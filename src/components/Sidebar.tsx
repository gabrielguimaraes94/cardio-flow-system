
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, Heart, FileText, Calendar, Settings, LogOut, Menu, FileUser, BarChart, Building } from 'lucide-react';
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
import { useClinic } from '@/contexts/ClinicContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const { clinics } = useClinic();

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Heart },
    { title: "Pacientes", url: "/patients", icon: Users },
    { title: "Anamnese", url: "/anamnesis", icon: FileUser },
    { title: "Cateterismo", url: "/catheterization", icon: FileText },
    { title: "Angioplastia", url: "/angioplasty", icon: FileText },
    { title: "Relatórios", url: "/reports", icon: BarChart },
    { title: "Agenda", url: "/schedule", icon: Calendar },
    { title: "Configurações", url: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    console.log('🚪 Logout button clicked');
    try {
      await signOut();
    } catch (error) {
      console.error('❌ Error in handleLogout:', error);
    }
  };

  return (
    <SidebarComponent variant="floating" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between p-2">
          {state === 'expanded' ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <Heart className="h-5 w-5 text-sidebar-accent-foreground flex-shrink-0" />
                <h1 className="text-lg font-bold text-sidebar-foreground truncate">CardioFlow</h1>
              </div>
              <SidebarTrigger className="h-8 w-8 flex-shrink-0" />
            </>
          ) : (
            <div className="flex items-center justify-center w-full">
              <SidebarTrigger className="h-8 w-8 flex-shrink-0" />
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url !== '/dashboard' && location.pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={state === 'collapsed' ? item.title : undefined}
                      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <Link to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          {/* Botão para alterar clínica - só mostra se há múltiplas clínicas */}
          {clinics.length > 1 && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={state === 'collapsed' ? 'Alterar Clínica' : undefined}
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Link to="/clinic-selection" className="flex items-center gap-3 w-full">
                  <Building className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Alterar Clínica</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={state === 'collapsed' ? 'Sair' : undefined}
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
};
