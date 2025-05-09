
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, Heart, FileText, Calendar, Settings, LogOut, Menu, FileUser, BarChart } from 'lucide-react';
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
  const location = useLocation();
  const { state } = useSidebar();

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Heart },
    { title: "Pacientes", url: "/patients", icon: Users },
    { title: "Anamnese", url: "/patients/:id/anamnesis", icon: FileUser },
    { title: "Cateterismo", url: "/catheterization", icon: FileText },
    { title: "Angioplastia", url: "/angioplasty", icon: FileText },
    { title: "Relatórios", url: "/reports", icon: BarChart },
    { title: "Agenda", url: "/schedule", icon: Calendar },
    { title: "Configurações", url: "/settings", icon: Settings },
  ];

  return (
    <SidebarComponent variant="floating" collapsible="icon">
      <SidebarHeader className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-white" />
          <h1 className={`text-xl font-bold text-white ${state === 'collapsed' ? 'hidden' : 'block'}`}>CardioFlow</h1>
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
                  <SidebarMenuButton asChild tooltip={state === 'collapsed' ? item.title : undefined}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button className={`w-full flex items-center gap-3 text-sidebar-foreground rounded-md hover:bg-sidebar-accent px-3 py-2 ${state === 'collapsed' ? 'justify-center' : ''}`} title={state === 'collapsed' ? "Sair" : undefined}>
            <LogOut className="h-5 w-5" />
            <span className={state === 'collapsed' ? 'hidden' : 'block'}>Sair</span>
          </button>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};
