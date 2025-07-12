import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClinicRegistrationForm } from '@/components/admin/ClinicRegistrationForm';

interface RegisterTabProps {
  onSuccess: () => void;
}

export const RegisterTab: React.FC<RegisterTabProps> = ({ onSuccess }) => {
  return (
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
  );
};