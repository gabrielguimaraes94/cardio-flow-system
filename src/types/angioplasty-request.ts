
import { z } from 'zod';
import { TussCode } from '@/components/angioplasty/TussCodeList';
import { MaterialWithQuantity } from '@/types/material';
import { Patient } from '@/components/angioplasty/PatientSelector';
import { SimpleInsuranceCompany } from '@/types/insurance-selector';

export const requestFormSchema = z.object({
  patientId: z.string().min(1, { message: 'Selecione um paciente' }),
  insuranceId: z.string().min(1, { message: 'Selecione um convênio' }),
  coronaryAngiography: z.string().optional(),
  proposedTreatment: z.string().optional(),
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;

export interface Doctor {
  id: string;
  name: string;
  crm: string;
}

export interface SurgicalTeam {
  surgeon: Doctor | null;
  assistant: Doctor | null;
  anesthesiologist: Doctor | null;
}

export interface AngioplastyRequestData {
  selectedPatient: Patient | null;
  selectedInsurance: SimpleInsuranceCompany | null;
  selectedProcedures: TussCode[];
  selectedMaterials: MaterialWithQuantity[];
  surgicalTeam: SurgicalTeam;
  requestNumber: string;
}
