
import React from 'react';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  const patientAge = differenceInYears(new Date(), new Date(patient.birthdate));
  const currentDate = new Date();
  
  return (
    <div className="w-full h-full bg-white overflow-auto p-8">
      <div ref={contentRef} className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="max-w-[100%]">
            <h1 className="text-xl font-bold">{clinic.name}</h1>
            <p className="text-sm">{clinic.address}</p>
            <p className="text-sm">{clinic.city}</p>
            <p className="text-sm">Tel: {clinic.phone}</p>
            {clinic.email && <p className="text-sm">Email: {clinic.email}</p>}
          </div>
        </div>
        
        {/* Location and date */}
        <div className="text-right mb-6">
          <p>{clinic.city || 'São Paulo'}, {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
        
        {/* Insurance */}
        <div className="mb-6">
          <p><strong>A/C:</strong> {insurance.name}</p>
        </div>
        
        {/* Patient info */}
        <div className="mb-6">
          <p><strong>Paciente:</strong> {patient.name}</p>
          <p><strong>Número da solicitação:</strong> {requestNumber}</p>
        </div>
        
        {/* Request title */}
        <h2 className="text-center text-lg font-bold uppercase my-6">Solicitação de Angioplastia Coronária</h2>
        
        {/* Clinical info */}
        <div className="mb-6">
          <h3 className="font-bold mb-2 border-b pb-1">Quadro Clínico</h3>
          <p>Idade do paciente: {patientAge} anos</p>
        </div>
        
        {/* Coronary angiography */}
        <div className="mb-6">
          <h3 className="font-bold mb-2 border-b pb-1">Coronariografia</h3>
          <p className="whitespace-pre-line">{coronaryAngiography}</p>
        </div>
        
        {/* Proposed treatment */}
        <div className="mb-6">
          <h3 className="font-bold mb-2 border-b pb-1">Tratamento Proposto</h3>
          <p className="whitespace-pre-line">{proposedTreatment}</p>
        </div>
        
        {/* TUSS procedures */}
        <div className="mb-6">
          <h3 className="font-bold mb-2 border-b pb-1">Código TUSS</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left w-1/3">Código</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {tussProcedures.map((proc, index) => (
                <tr key={proc.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2">{proc.code}</td>
                  <td className="border border-gray-300 px-4 py-2">{proc.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Materials */}
        {materials.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2 border-b pb-1">Materiais Solicitados</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                  <th className="border border-gray-300 px-4 py-2 text-center w-1/5">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material, index) => (
                  <tr key={material.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2">{material.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{material.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Surgical team */}
        <div className="mb-10">
          <h3 className="font-bold mb-2 border-b pb-1">Equipe Cirúrgica</h3>
          <table className="w-full">
            <tbody>
              {surgicalTeam.surgeon && (
                <tr>
                  <td className="py-1 font-medium w-1/4">Cirurgião:</td>
                  <td className="py-1">{surgicalTeam.surgeon.name} - {surgicalTeam.surgeon.crm}</td>
                </tr>
              )}
              
              {surgicalTeam.assistant && (
                <tr>
                  <td className="py-1 font-medium w-1/4">Auxiliar:</td>
                  <td className="py-1">{surgicalTeam.assistant.name} - {surgicalTeam.assistant.crm}</td>
                </tr>
              )}
              
              {surgicalTeam.anesthesiologist && (
                <tr>
                  <td className="py-1 font-medium w-1/4">Anestesista:</td>
                  <td className="py-1">{surgicalTeam.anesthesiologist.name} - {surgicalTeam.anesthesiologist.crm}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Signature */}
        {surgicalTeam.surgeon && (
          <div className="mt-16 text-center">
            <div className="w-64 mx-auto border-t border-gray-400 pt-2">
              <p>{surgicalTeam.surgeon.name}</p>
              <p className="text-sm">{surgicalTeam.surgeon.crm}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
