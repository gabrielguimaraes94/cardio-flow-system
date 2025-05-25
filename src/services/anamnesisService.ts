
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

export const anamnesisSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  created_by: z.string().uuid(),
  
  // Fatores de risco cardiovascular
  hypertension: z.boolean().default(false),
  hypertension_time: z.string().optional(),
  hypertension_meds: z.string().optional(),
  diabetes: z.boolean().default(false),
  diabetes_type: z.string().optional(),
  diabetes_control: z.string().optional(),
  diabetes_meds: z.string().optional(),
  dyslipidemia: z.boolean().default(false),
  cholesterol: z.string().optional(),
  ldl: z.string().optional(),
  hdl: z.string().optional(),
  triglycerides: z.string().optional(),
  dyslipidemia_meds: z.string().optional(),
  smoking: z.string().optional(),
  smoking_years: z.string().optional(),
  family_history: z.boolean().default(false),
  family_history_details: z.string().optional(),
  obesity: z.boolean().default(false),
  bmi: z.string().optional(),
  sedentary: z.boolean().default(false),
  physical_activity: z.string().optional(),
  
  // Histórico cardiovascular
  previous_iam: z.boolean().default(false),
  iam_date: z.string().optional(),
  iam_location: z.string().optional(),
  iam_treatment: z.string().optional(),
  previous_angioplasty: z.boolean().default(false),
  angioplasty_date: z.string().optional(),
  angioplasty_vessels: z.string().optional(),
  angioplasty_stents: z.string().optional(),
  revascularization: z.boolean().default(false),
  revascularization_date: z.string().optional(),
  revascularization_grafts: z.string().optional(),
  valvopathy: z.boolean().default(false),
  valvopathy_type: z.string().optional(),
  valvopathy_severity: z.string().optional(),
  heart_failure: z.boolean().default(false),
  heart_failure_class: z.string().optional(),
  
  // Comorbidades adicionais
  renal_disease: z.boolean().default(false),
  renal_stage: z.string().optional(),
  dialysis: z.boolean().default(false),
  respiratory_disease: z.boolean().default(false),
  respiratory_type: z.string().optional(),
  respiratory_control: z.string().optional(),
  stroke: z.boolean().default(false),
  stroke_type: z.string().optional(),
  stroke_date: z.string().optional(),
  stroke_sequelae: z.string().optional(),
  pad: z.boolean().default(false),
  pad_severity: z.string().optional(),
  pad_treatment: z.string().optional(),
  other_comorbidities: z.boolean().default(false),
  other_comorbidities_details: z.string().optional(),
  
  // Sintomas atuais
  chest_pain: z.boolean().default(false),
  chest_pain_characteristics: z.string().optional(),
  chest_pain_duration: z.string().optional(),
  chest_pain_radiation: z.string().optional(),
  dyspnea: z.boolean().default(false),
  dyspnea_class: z.string().optional(),
  syncope: z.boolean().default(false),
  syncope_frequency: z.string().optional(),
  palpitations: z.boolean().default(false),
  palpitations_characteristics: z.string().optional(),
  edema: z.boolean().default(false),
  edema_location: z.string().optional(),
  edema_intensity: z.string().optional(),
  
  // Medicações em uso
  medications: z.array(z.object({
    name: z.string(),
    dose: z.string(),
    posology: z.string()
  })).default([]),
  antiplatelets: z.boolean().default(false),
  aas: z.boolean().default(false),
  clopidogrel: z.boolean().default(false),
  ticagrelor: z.boolean().default(false),
  prasugrel: z.boolean().default(false),
  anticoagulants: z.boolean().default(false),
  warfarin: z.boolean().default(false),
  dabigatran: z.boolean().default(false),
  rivaroxaban: z.boolean().default(false),
  apixaban: z.boolean().default(false),
  edoxaban: z.boolean().default(false),
  
  // Informações do médico responsável
  doctor_name: z.string().optional(),
  doctor_crm: z.string().optional(),
});

export type AnamnesisData = z.infer<typeof anamnesisSchema>;

interface AnamnesisRecord {
  id: string;
  patient_id: string;
  created_by: string;
  created_at: string;
  doctor_name?: string;
  doctor_crm?: string;
}

export const anamnesisService = {
  async createAnamnesis(data: Omit<AnamnesisData, 'id'>) {
    console.log('Criando anamnese:', data);
    
    const { data: result, error } = await supabase
      .from('anamnesis')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar anamnese:', error);
      throw new Error(`Erro ao salvar anamnese: ${error.message}`);
    }

    console.log('Anamnese criada com sucesso:', result);
    return { anamnesis: result };
  },

  async getAnamnesisById(id: string) {
    console.log('Buscando anamnese por ID:', id);
    
    const { data, error } = await supabase
      .from('anamnesis')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar anamnese:', error);
      throw new Error(`Erro ao buscar anamnese: ${error.message}`);
    }

    return { anamnesis: data };
  },

  async getPatientAnamnesis(patientId: string): Promise<{ anamnesis: AnamnesisRecord[] }> {
    console.log('Buscando anamneses do paciente:', patientId);
    
    const { data, error } = await supabase
      .from('anamnesis')
      .select('id, patient_id, created_by, created_at, doctor_name, doctor_crm')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar anamneses:', error);
      throw new Error(`Erro ao buscar anamneses: ${error.message}`);
    }

    return { anamnesis: data || [] };
  },

  async updateAnamnesis(id: string, data: Partial<AnamnesisData>) {
    console.log('Atualizando anamnese:', id, data);
    
    const { data: result, error } = await supabase
      .from('anamnesis')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar anamnese:', error);
      throw new Error(`Erro ao atualizar anamnese: ${error.message}`);
    }

    return { anamnesis: result };
  },

  async deleteAnamnesis(id: string) {
    console.log('Deletando anamnese:', id);
    
    const { error } = await supabase
      .from('anamnesis')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar anamnese:', error);
      throw new Error(`Erro ao deletar anamnese: ${error.message}`);
    }

    return { success: true };
  }
};
