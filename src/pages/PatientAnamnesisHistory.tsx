
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AnamnesisHistory } from '@/components/patients/AnamnesisHistory';
import { usePatientAnamnesis } from '@/hooks/usePatientAnamnesis';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatient } from '@/contexts/PatientContext';
import { patientService } from '@/services/patientService';
import { useToast } from '@/hooks/use-toast';

export const PatientAnamnesisHistory: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { selectedPatient, setSelectedPatient } = usePatient();
  const { loading, anamnesisRecords } = usePatientAnamnesis(patientId);
  const { toast } = useToast();

  // Carrega dados do paciente se não estiver já selecionado
  useEffect(() => {
    const fetchPatientData = async () => {
      if (patientId && (!selectedPatient || selectedPatient.id !== patientId)) {
        try {
          const { patient } = await patientService.getPatientById(patientId);
          if (patient) {
            setSelectedPatient({
              ...patient,
              age: patient.birthdate ? new Date().getFullYear() - new Date(patient.birthdate).getFullYear() : undefined
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do paciente:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do paciente.",
            variant: "destructive"
          });
        }
      }
    };

    fetchPatientData();
  }, [patientId, selectedPatient, setSelectedPatient, toast]);

  const handleBack = () => {
    navigate('/patients');
  };

  if (loading || !selectedPatient) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <AnamnesisHistory 
          patientName={selectedPatient.name}
          patientId={patientId || ''}
          anamnesisRecords={anamnesisRecords}
          onBackClick={handleBack}
        />
      </div>
    </Layout>
  );
};
