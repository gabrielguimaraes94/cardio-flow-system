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
        <CardTitle>Register New Clinic</CardTitle>
        <CardDescription>
          Register a new clinic and its administrator in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClinicRegistrationForm onSuccess={onSuccess} />
      </CardContent>
    </Card>
  );
};