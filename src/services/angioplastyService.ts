
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

export type AngioplastyStatus = 'active' | 'cancelled';

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
  status: AngioplastyStatus;
  createdAt: string;
  createdBy: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
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
  async saveRequest(data: Omit<AngioplastyRequest, 'id' | 'createdAt' | 'status' | 'cancelledAt' | 'cancelledBy' | 'cancellationReason'>): Promise<{ id: string } | null> {
    try {
      console.log('🔍 Dados recebidos para salvamento:', data);
      
      // Validar se insurance_id é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.insuranceId)) {
        console.error('❌ insurance_id não é um UUID válido:', data.insuranceId);
        throw new Error('ID do convênio inválido');
      }
      
      // Verificar se o convênio existe no banco de dados
      const { data: insuranceExists, error: insuranceError } = await supabase
        .from('insurance_companies')
        .select('id, company_name')
        .eq('id', data.insuranceId)
        .single();
        
      if (insuranceError || !insuranceExists) {
        console.error('❌ Convênio não encontrado no banco de dados:', data.insuranceId);
        console.error('❌ Erro ao buscar convênio:', insuranceError);
        throw new Error('Convênio não encontrado');
      }
      
      console.log('✅ Convênio encontrado:', insuranceExists);
      
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
      
      console.log('📤 Dados preparados para inserção:', insertData);
      
      const { data: result, error } = await supabase
        .from('angioplasty_requests')
        .insert(insertData)
        .select('id')
        .single();
      
      if (error) {
        console.error('❌ Erro do Supabase ao salvar solicitação:', error);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Mensagem do erro:', error.message);
        console.error('❌ Detalhes do erro:', error.details);
        throw error;
      }
      
      console.log('✅ Solicitação salva com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro geral ao salvar solicitação de angioplastia:', error);
      return null;
    }
  },

  async getAllRequests(statusFilter?: AngioplastyStatus): Promise<AngioplastyRequest[]> {
    try {
      let query = supabase
        .from('angioplasty_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase error fetching all requests:', error);
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
        status: item.status as AngioplastyStatus,
        createdAt: item.created_at,
        createdBy: item.created_by,
        cancelledAt: item.cancelled_at,
        cancelledBy: item.cancelled_by,
        cancellationReason: item.cancellation_reason
      })) : [];
    } catch (error) {
      console.error('Error fetching all angioplasty requests:', error);
      return [];
    }
  },

  async cancelRequest(requestId: string, cancelledBy: string, reason?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('angioplasty_requests')
        .update({
          status: 'cancelled' as AngioplastyStatus,
          cancelled_at: new Date().toISOString(),
          cancelled_by: cancelledBy,
          cancellation_reason: reason || 'Solicitação cancelada'
        })
        .eq('id', requestId);
      
      if (error) {
        console.error('Erro ao cancelar solicitação:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error cancelling angioplasty request:', error);
      return false;
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
        status: item.status as AngioplastyStatus,
        createdAt: item.created_at,
        createdBy: item.created_by,
        cancelledAt: item.cancelled_at,
        cancelledBy: item.cancelled_by,
        cancellationReason: item.cancellation_reason
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
