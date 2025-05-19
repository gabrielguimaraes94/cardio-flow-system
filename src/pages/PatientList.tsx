
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';
import { PatientFormModal } from '@/components/patients/PatientFormModal';
import { PatientListHeader } from '@/components/patients/PatientListHeader';
import { PatientSearchBar } from '@/components/patients/PatientSearchBar';
import { PatientTable } from '@/components/patients/PatientTable';
import { usePatients } from '@/hooks/usePatients';
import { Loader2 } from 'lucide-react';

export const PatientList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedClinic, loading: clinicLoading } = useClinic();
  const { toast } = useToast();
  const { 
    patients, 
    isLoading: patientsLoading, 
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

  // Mostra um indicador de carregamento se estiver carregando dados de clínicas
  if (clinicLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-cardio-500 mb-4" />
          <p className="text-xl font-medium text-gray-600">Carregando configurações da clínica...</p>
        </div>
      </Layout>
    );
  }

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
          isLoading={patientsLoading}
          onPatientDeleted={fetchPatients}
        />
        {/* Modal de criação de paciente */}
        <PatientFormModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={fetchPatients}
        />
      </div>
    </Layout>
  );
};
