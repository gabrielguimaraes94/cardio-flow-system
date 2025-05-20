
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

export interface Doctor {
  id: string;
  name: string;
  crm: string;
}

export interface Patient {
  id: string;
  name: string;
  birthdate: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
}

export interface TussCode {
  id: string;
  code: string;
  description: string;
}

export interface MaterialWithQuantity {
  id: string;
  description: string;
  quantity: number;
}

export interface SurgicalTeam {
  surgeon: Doctor | null;
  assistant: Doctor | null;
  anesthesiologist: Doctor | null;
}

export interface AngioplastyRequest {
  id: string;
  patientId: string;
  patientName: string;
  insuranceId: string;
  insuranceName: string;
  clinicId: string;
  requestNumber: string;
  coronaryAngiography: string;
  proposedTreatment: string;
  tussProcedures: TussCode[];
  materials: MaterialWithQuantity[];
  surgicalTeam: SurgicalTeam;
  createdAt: string;
  createdBy: string;
}

// Interface para representar os dados exatos enviados ao Supabase
interface AngioplastyRequestInsert {
  patient_id: string;
  patient_name: string;
  insurance_id: string;
  insurance_name: string;
  clinic_id: string;
  request_number: string;
  coronary_angiography: string;
  proposed_treatment: string;
  tuss_procedures: Json;
  materials: Json;
  surgical_team: Json;
  created_by: string;
}

export const angioplastyService = {
  async saveRequest(data: Omit<AngioplastyRequest, 'id' | 'createdAt'>): Promise<{ id: string } | null> {
    try {
      // Converter para o formato esperado pelo Supabase
      const insertData: AngioplastyRequestInsert = {
        patient_id: data.patientId,
        patient_name: data.patientName,
        insurance_id: data.insuranceId,
        insurance_name: data.insuranceName,
        clinic_id: data.clinicId,
        request_number: data.requestNumber,
        coronary_angiography: data.coronaryAngiography,
        proposed_treatment: data.proposedTreatment,
        tuss_procedures: data.tussProcedures as unknown as Json,
        materials: data.materials as unknown as Json,
        surgical_team: data.surgicalTeam as unknown as Json,
        created_by: data.createdBy
      };
      
      const { data: result, error } = await supabase
        .from('angioplasty_requests')
        .insert(insertData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Supabase error saving request:', error);
        throw error;
      }
      
      return result;
    } catch (error) {
      console.error('Error saving angioplasty request:', error);
      return null;
    }
  },

  async getRequestsByPatientId(patientId: string): Promise<AngioplastyRequest[]> {
    try {
      const { data, error } = await supabase
        .from('angioplasty_requests')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error fetching requests:', error);
        throw error;
      }
      
      // Converter de snake_case para camelCase e fazer os casts de tipo adequados
      return data ? data.map(item => ({
        id: item.id,
        patientId: item.patient_id,
        patientName: item.patient_name,
        insuranceId: item.insurance_id,
        insuranceName: item.insurance_name,
        clinicId: item.clinic_id,
        requestNumber: item.request_number,
        coronaryAngiography: item.coronary_angiography,
        proposedTreatment: item.proposed_treatment,
        tussProcedures: (item.tuss_procedures as unknown) as TussCode[],
        materials: (item.materials as unknown) as MaterialWithQuantity[],
        surgicalTeam: (item.surgical_team as unknown) as SurgicalTeam,
        createdAt: item.created_at,
        createdBy: item.created_by
      })) : [];
    } catch (error) {
      console.error('Error fetching angioplasty requests:', error);
      return [];
    }
  },

  generateRequestNumber(): string {
    // Generate a unique request number with format ANP-YYYYMMDD-XXXXX
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = uuidv4().substring(0, 5).toUpperCase();
    return `ANP-${date}-${random}`;
  }
};
