
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';
import { PatientFormModal } from '@/components/patients/PatientFormModal';
import { PatientListHeader } from '@/components/patients/PatientListHeader';
import { PatientSearchBar } from '@/components/patients/PatientSearchBar';
import { PatientTable } from '@/components/patients/PatientTable';
import { usePatients } from '@/hooks/usePatients';

export const PatientList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedClinic } = useClinic();
  const { toast } = useToast();
  const { 
    patients, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    fetchPatients 
  } = usePatients();

  const handleNewPatient = () => {
    if (!selectedClinic) {
      toast({
        title: "Selecione uma clínica",
        description: "É necessário selecionar uma clínica antes de criar um novo paciente.",
        variant: "destructive"
      });
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PatientListHeader onNewPatient={handleNewPatient} />
        <PatientSearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <PatientTable 
          patients={patients}
          isLoading={isLoading}
          onPatientDeleted={fetchPatients}
        />
        <PatientFormModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={fetchPatients}
        />
      </div>
    </Layout>
  );
};
