import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, Heart, FileText, Calendar, Settings, LogOut, Menu, UserPlus, FileUser, BarChart } from 'lucide-react';
import { 
  Sidebar as SidebarComponent,
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar';

export const Sidebar: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handlePatientSelected = (event: CustomEvent) => {
      const { patientId, patientName } = event.detail;
      setSelectedPatientId(patientId);
      setSelectedPatientName(patientName);
    };

    const updatePatientFromStorage = () => {
      const patientId = localStorage.getItem('selectedPatientId');
      const patientName = localStorage.getItem('selectedPatientName');
      setSelectedPatientId(patientId);
      setSelectedPatientName(patientName);
    };

    // Update state when component mounts or route changes
    updatePatientFromStorage();

    // Add event listener for patient selection
    window.addEventListener('patientSelected', handlePatientSelected as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('patientSelected', handlePatientSelected as EventListener);
    };
  }, [location.pathname]); // Re-run when route changes

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Heart },
    { 
      title: "Pacientes", 
      url: "/patients", 
      icon: Users,
      submenu: [
        { title: "Lista de Pacientes", url: "/patients", icon: Users },
        { title: "Novo Paciente", url: "/patients/new", icon: UserPlus },
        { 
          title: "Anamnese", 
          url: selectedPatientId ? `/patients/${selectedPatientId}/anamnesis` : "/patients/:id/anamnesis", 
          icon: FileUser, 
          disabled: !selectedPatientId, 
          tooltip: selectedPatientId 
            ? `Anamnese de ${selectedPatientName}` 
            : "Selecione um paciente primeiro" 
        }
      ]
    },
    { title: "Cateterismo", url: "/catheterization", icon: FileText },
    { title: "Angioplastia", url: "/angioplasty", icon: FileText },
    { title: "Relatórios", url: "/reports", icon: BarChart },
    { title: "Agenda", url: "/schedule", icon: Calendar },
    { title: "Configurações", url: "/settings", icon: Settings },
  ];

  return (
    <SidebarComponent>
      <SidebarHeader className="px-6 py-5">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-white" />
          <h1 className="text-xl font-bold text-white">CardioFlow</h1>
        </div>
        <SidebarTrigger>
          <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
            <Menu className="h-5 w-5" />
          </button>
        </SidebarTrigger>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <>
                      <SidebarMenuButton>
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.submenu.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild={!subItem.disabled}
                              aria-disabled={subItem.disabled}
                            >
                              {subItem.disabled ? (
                                <div className="flex items-center gap-2 opacity-50 cursor-not-allowed" title={subItem.tooltip}>
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </div>
                              ) : (
                                <Link to={subItem.url} className="flex items-center gap-2">
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button className="w-full flex items-center gap-3 text-sidebar-foreground rounded-md hover:bg-sidebar-accent px-3 py-2">
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};
