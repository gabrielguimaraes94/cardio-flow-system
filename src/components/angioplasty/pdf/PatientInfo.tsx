
import React from 'react';

interface Patient {
  id: string;
  name: string;
}

interface PatientInfoProps {
  patient: Patient;
  requestNumber: string;
  insuranceName: string;
}

export const PatientInfo: React.FC<PatientInfoProps> = ({ 
  patient, 
  requestNumber,
  insuranceName 
}) => {
  return (
    <>
      <div className="text-right mb-6">
        <p>{localStorage.getItem('clinicCity') || 'São Paulo'}, {new Date().toLocaleDateString('pt-BR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })}</p>
      </div>
      
      <div className="mb-6">
        <p><strong>A/C:</strong> {insuranceName}</p>
      </div>
      
      <div className="mb-6">
        <p><strong>Paciente:</strong> {patient.name}</p>
        <p><strong>Número da solicitação:</strong> {requestNumber}</p>
      </div>
    </>
  );
};
