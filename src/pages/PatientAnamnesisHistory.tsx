
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AnamnesisHistory } from '@/components/patients/AnamnesisHistory';
import { usePatientAnamnesis } from '@/hooks/usePatientAnamnesis';
import { Skeleton } from '@/components/ui/skeleton';

export const PatientAnamnesisHistory: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState<string>('');
  const { loading, anamnesisRecords } = usePatientAnamnesis(patientId);

  useEffect(() => {
    // In a real app, you'd fetch the patient details from an API
    // For now, we'll use mock data
    if (patientId) {
      const mockPatients = {
        '1': 'João Silva',
        '2': 'Maria Oliveira',
        '3': 'José Pereira',
        '4': 'Antônia Souza',
        '5': 'Carlos Santos',
      };
      
      setPatientName(mockPatients[patientId as keyof typeof mockPatients] || 'Paciente');
    }
  }, [patientId]);

  const handleBack = () => {
    navigate('/patients');
  };

  if (loading) {
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
          patientName={patientName}
          patientId={patientId || ''}
          anamnesisRecords={anamnesisRecords}
          onBackClick={handleBack}
        />
      </div>
    </Layout>
  );
};
