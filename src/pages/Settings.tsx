
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from '@/components/Layout';
import { UserManagement } from '@/components/settings/UserManagement';
import { ClinicManagement } from '@/components/settings/ClinicManagement';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { InsuranceSettings } from '@/components/settings/InsuranceSettings';
import { TussCodeSettings } from '@/components/settings/TussCodeSettings';
import { MaterialsSettings } from '@/components/settings/MaterialsSettings';

const Settings = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Define which tab to show based on URL path
  const getActiveTab = (): 'users' | 'clinics' | 'insurance' | 'profile' | 'tuss' | 'materials' => {
    if (path.includes('/insurance')) return 'insurance';
    if (path.includes('/clinics')) return 'clinics';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/tuss')) return 'tuss';
    if (path.includes('/materials')) return 'materials';
    return 'users';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, clínicas, convênios, procedimentos e preferências do sistema.
          </p>
        </div>
        
        <NavigationMenu className="max-w-full w-full justify-start">
          <NavigationMenuList className="flex flex-wrap gap-1 border-b border-gray-200 w-full">
            <NavigationMenuItem>
              <Link to="/settings" className={cn(
                navigationMenuTriggerStyle(),
                'rounded-b-none border-b-2 border-transparent',
                getActiveTab() === 'users' ? 'border-cardio-500 text-cardio-500' : 'hover:border-gray-300'
              )}>
                Usuários
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings/clinics" className={cn(
                navigationMenuTriggerStyle(),
                'rounded-b-none border-b-2 border-transparent',
                getActiveTab() === 'clinics' ? 'border-cardio-500 text-cardio-500' : 'hover:border-gray-300'
              )}>
                Clínicas
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings/insurance" className={cn(
                navigationMenuTriggerStyle(),
                'rounded-b-none border-b-2 border-transparent',
                getActiveTab() === 'insurance' ? 'border-cardio-500 text-cardio-500' : 'hover:border-gray-300'
              )}>
                Convênios
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings/tuss" className={cn(
                navigationMenuTriggerStyle(),
                'rounded-b-none border-b-2 border-transparent',
                getActiveTab() === 'tuss' ? 'border-cardio-500 text-cardio-500' : 'hover:border-gray-300'
              )}>
                Códigos TUSS
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings/materials" className={cn(
                navigationMenuTriggerStyle(),
                'rounded-b-none border-b-2 border-transparent',
                getActiveTab() === 'materials' ? 'border-cardio-500 text-cardio-500' : 'hover:border-gray-300'
              )}>
                Materiais
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings/profile" className={cn(
                navigationMenuTriggerStyle(),
                'rounded-b-none border-b-2 border-transparent',
                getActiveTab() === 'profile' ? 'border-cardio-500 text-cardio-500' : 'hover:border-gray-300'
              )}>
                Meu Perfil
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="mt-6">
          {path === '/settings' && <UserManagement />}
          {path === '/settings/clinics' && <ClinicManagement />}
          {path === '/settings/insurance' && <InsuranceSettings />}
          {path === '/settings/tuss' && <TussCodeSettings />}
          {path === '/settings/materials' && <MaterialsSettings />}
          {path === '/settings/profile' && <ProfileSettings />}
          <Outlet />
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
