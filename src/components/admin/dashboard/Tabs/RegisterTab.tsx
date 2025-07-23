import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicRegistrationForm } from '@/components/admin/ClinicRegistrationForm';
import { StaffCreationForm } from '@/components/admin/StaffCreationForm';

interface RegisterTabProps {
  onSuccess: () => void;
}

export const RegisterTab: React.FC<RegisterTabProps> = ({ onSuccess }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="clinic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clinic">Nova Clínica</TabsTrigger>
          <TabsTrigger value="staff">Novo Funcionário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Nova Clínica</CardTitle>
              <CardDescription>
                Registre uma nova clínica e seu administrador no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClinicRegistrationForm onSuccess={onSuccess} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff">
          <StaffCreationForm onSuccess={onSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
};