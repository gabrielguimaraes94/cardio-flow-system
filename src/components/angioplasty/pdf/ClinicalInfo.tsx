
import React from 'react';
import { differenceInYears } from 'date-fns';

interface ClinicalInfoProps {
  patientBirthdate: string;
  coronaryAngiography: string;
  proposedTreatment: string;
}

export const ClinicalInfo: React.FC<ClinicalInfoProps> = ({
  patientBirthdate,
  coronaryAngiography,
  proposedTreatment
}) => {
  const patientAge = differenceInYears(new Date(), new Date(patientBirthdate));
  
  return (
    <>
      <h2 className="text-center text-lg font-bold uppercase my-6">Solicitação de Angioplastia Coronária</h2>
      
      <div className="mb-6">
        <h3 className="font-bold mb-2 border-b pb-1">Quadro Clínico</h3>
        <p>Idade do paciente: {patientAge} anos</p>
      </div>
      
      <div className="mb-6">
        <h3 className="font-bold mb-2 border-b pb-1">Coronariografia</h3>
        <p className="whitespace-pre-line">{coronaryAngiography}</p>
      </div>
      
      <div className="mb-6">
        <h3 className="font-bold mb-2 border-b pb-1">Tratamento Proposto</h3>
        <p className="whitespace-pre-line">{proposedTreatment}</p>
      </div>
    </>
  );
};
