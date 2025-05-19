
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface PatientListHeaderProps {
  onNewPatient: () => void;
}

export const PatientListHeader: React.FC<PatientListHeaderProps> = ({ onNewPatient }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-3xl font-bold mb-1">Pacientes</h2>
        <p className="text-gray-500">Gerenciar cadastro de pacientes</p>
      </div>
      <Button 
        className="bg-cardio-500 hover:bg-cardio-600" 
        onClick={onNewPatient} // Usando a função passada como prop
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Novo Paciente
      </Button>
    </div>
  );
};
