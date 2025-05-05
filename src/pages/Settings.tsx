
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from '@/components/Layout';
import { UserManagement } from '@/components/settings/UserManagement';
import { ClinicManagement } from '@/components/settings/ClinicManagement';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, clínicas e preferências do sistema.
          </p>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="clinics">Clínicas</TabsTrigger>
            <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="space-y-4 mt-4">
            <UserManagement />
          </TabsContent>
          <TabsContent value="clinics" className="space-y-4 mt-4">
            <ClinicManagement />
          </TabsContent>
          <TabsContent value="profile" className="space-y-4 mt-4">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
