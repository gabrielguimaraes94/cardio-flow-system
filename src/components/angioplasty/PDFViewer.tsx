
import React from 'react';
import { Header } from './pdf/Header';
import { PatientInfo } from './pdf/PatientInfo';
import { ClinicalInfo } from './pdf/ClinicalInfo';
import { ProceduresTable } from './pdf/ProceduresTable';
import { MaterialsTable } from './pdf/MaterialsTable';
import { SurgicalTeam } from './pdf/SurgicalTeam';

interface Doctor {
  id: string;
  name: string;
  crm: string;
}

interface Patient {
  id: string;
  name: string;
  birthdate: string;
}

interface InsuranceCompany {
  id: string;
  name: string;
}

interface TussCode {
  id: string;
  code: string;
  description: string;
}

interface MaterialWithQuantity {
  id: string;
  description: string;
  quantity: number;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  city?: string;
  email?: string;
}

interface SurgicalTeam {
  surgeon: Doctor | null;
  assistant: Doctor | null;
  anesthesiologist: Doctor | null;
}

interface PDFViewerProps {
  patient: Patient | null;
  insurance: InsuranceCompany | null;
  clinic: Clinic;
  tussProcedures: TussCode[];
  materials: MaterialWithQuantity[];
  surgicalTeam: SurgicalTeam;
  coronaryAngiography: string;
  proposedTreatment: string;
  requestNumber: string;
  contentRef: React.RefObject<HTMLDivElement>;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  patient,
  insurance,
  clinic,
  tussProcedures,
  materials,
  surgicalTeam,
  coronaryAngiography,
  proposedTreatment,
  requestNumber,
  contentRef
}) => {
  if (!patient || !insurance) {
    return <div className="text-center p-8">Dados insuficientes para gerar o PDF</div>;
  }
  
  return (
    <div className="w-full h-full bg-white overflow-auto p-8">
      <div ref={contentRef} className="max-w-[800px] mx-auto">
        <Header clinic={clinic} />
        
        <PatientInfo 
          patient={patient} 
          requestNumber={requestNumber}
          insuranceName={insurance.name}
        />
        
        <ClinicalInfo 
          patientBirthdate={patient.birthdate}
          coronaryAngiography={coronaryAngiography}
          proposedTreatment={proposedTreatment}
        />
        
        <ProceduresTable tussProcedures={tussProcedures} />
        
        <MaterialsTable materials={materials} />
        
        <SurgicalTeam 
          surgeon={surgicalTeam.surgeon}
          assistant={surgicalTeam.assistant}
          anesthesiologist={surgicalTeam.anesthesiologist}
        />
      </div>
    </div>
  );
};
