
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from '@/components/Layout';
import { UserManagement } from '@/components/settings/UserManagement';
import { ClinicManagement } from '@/components/settings/ClinicManagement';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InsuranceList } from './insurance/InsuranceList';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Settings = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Define which tab to show based on URL path
  const getActiveTab = () => {
    if (path.includes('/insurance')) return 'insurance';
    if (path === '/settings') return 'users';
    return 'users';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, clínicas, convênios e preferências do sistema.
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
          {path === '/settings/insurance' && <InsuranceList />}
          {path === '/settings/profile' && <ProfileSettings />}
          <Outlet />
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
