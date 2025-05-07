import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, Heart, FileText, Calendar, Settings, LogOut, Menu, UserPlus, FileUser, BarChart, Building2 } from 'lucide-react';
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
  SidebarMenuSubButton,
  useSidebar
} from '@/components/ui/sidebar';

export const Sidebar: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);
  const location = useLocation();
  const { state } = useSidebar();

  // Event handling for patient selection
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
    { 
      title: "Convênios", 
      url: "/insurance", 
      icon: Building2,
      submenu: [
        { title: "Lista de Convênios", url: "/insurance", icon: Building2 },
        { title: "Novo Convênio", url: "/insurance/new", icon: Building2 },
        { title: "Contratos", url: "/insurance", icon: FileText, 
          disabled: true, 
          tooltip: "Selecione um convênio primeiro" 
        },
      ]
    },
    { title: "Relatórios", url: "/reports", icon: BarChart },
    { title: "Agenda", url: "/schedule", icon: Calendar },
    { title: "Configurações", url: "/settings", icon: Settings },
  ];

  return (
    <SidebarComponent 
      variant="floating" 
      collapsible="icon"
      className="z-50 shadow-lg"
    >
      {/* Header com logo */}
      <SidebarHeader className="px-6 py-5 flex items-center justify-between">
        <div className={`flex items-center gap-2 ${state === 'collapsed' ? 'justify-center w-full' : ''}`}>
          {/* Logo sempre visível */}
          <Heart className="h-6 w-6 text-white" />
          {/* Nome da aplicação que desaparece quando colapsado */}
          <h1 className={`text-xl font-bold text-white transition-opacity duration-300 ${state === 'collapsed' ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            CardioFlow
          </h1>
        </div>
        
        {/* Botão apenas visível quando expandido */}
        <SidebarTrigger className={state === 'collapsed' ? 'hidden' : 'block'}>
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
                      <SidebarMenuButton tooltip={state === 'collapsed' ? item.title : undefined}>
                        <div className={`flex items-center gap-3 ${state === 'collapsed' ? 'justify-center' : ''}`}>
                          {/* Centraliza o ícone quando colapsado */}
                          <item.icon className={`h-5 w-5 ${state === 'collapsed' ? 'mx-auto' : ''}`} />
                          {/* Texto escondido quando colapsado */}
                          <span className={`transition-all duration-300 ${state === 'collapsed' ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                            {item.title}
                          </span>
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
                    <SidebarMenuButton asChild tooltip={state === 'collapsed' ? item.title : undefined}>
                      <Link to={item.url} className={`flex items-center gap-3 ${state === 'collapsed' ? 'justify-center' : ''}`}>
                        {/* Centraliza o ícone quando colapsado */}
                        <item.icon className={`h-5 w-5 ${state === 'collapsed' ? 'mx-auto' : ''}`} />
                        {/* Texto escondido quando colapsado */}
                        <span className={`transition-all duration-300 ${state === 'collapsed' ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                          {item.title}
                        </span>
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
          <button className={`w-full flex items-center gap-3 text-sidebar-foreground rounded-md hover:bg-sidebar-accent px-3 py-2 ${state === 'collapsed' ? 'justify-center' : ''}`} title={state === 'collapsed' ? "Sair" : undefined}>
            {/* Centraliza o ícone quando colapsado */}
            <LogOut className={`h-5 w-5 ${state === 'collapsed' ? 'mx-auto' : ''}`} />
            {/* Texto escondido quando colapsado */}
            <span className={`transition-all duration-300 ${state === 'collapsed' ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Sair
            </span>
          </button>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};