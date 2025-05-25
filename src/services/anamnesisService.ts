
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
    
    // Prepare data for Supabase insertion - remove undefined values and convert types
    const insertData = {
      patient_id: data.patient_id,
      created_by: data.created_by,
      hypertension: data.hypertension || false,
      hypertension_time: data.hypertension_time || null,
      hypertension_meds: data.hypertension_meds || null,
      diabetes: data.diabetes || false,
      diabetes_type: data.diabetes_type || null,
      diabetes_control: data.diabetes_control || null,
      diabetes_meds: data.diabetes_meds || null,
      dyslipidemia: data.dyslipidemia || false,
      cholesterol: data.cholesterol || null,
      ldl: data.ldl || null,
      hdl: data.hdl || null,
      triglycerides: data.triglycerides || null,
      dyslipidemia_meds: data.dyslipidemia_meds || null,
      smoking: data.smoking || null,
      smoking_years: data.smoking_years || null,
      family_history: data.family_history || false,
      family_history_details: data.family_history_details || null,
      obesity: data.obesity || false,
      bmi: data.bmi || null,
      sedentary: data.sedentary || false,
      physical_activity: data.physical_activity || null,
      previous_iam: data.previous_iam || false,
      iam_date: data.iam_date || null,
      iam_location: data.iam_location || null,
      iam_treatment: data.iam_treatment || null,
      previous_angioplasty: data.previous_angioplasty || false,
      angioplasty_date: data.angioplasty_date || null,
      angioplasty_vessels: data.angioplasty_vessels || null,
      angioplasty_stents: data.angioplasty_stents || null,
      revascularization: data.revascularization || false,
      revascularization_date: data.revascularization_date || null,
      revascularization_grafts: data.revascularization_grafts || null,
      valvopathy: data.valvopathy || false,
      valvopathy_type: data.valvopathy_type || null,
      valvopathy_severity: data.valvopathy_severity || null,
      heart_failure: data.heart_failure || false,
      heart_failure_class: data.heart_failure_class || null,
      renal_disease: data.renal_disease || false,
      renal_stage: data.renal_stage || null,
      dialysis: data.dialysis || false,
      respiratory_disease: data.respiratory_disease || false,
      respiratory_type: data.respiratory_type || null,
      respiratory_control: data.respiratory_control || null,
      stroke: data.stroke || false,
      stroke_type: data.stroke_type || null,
      stroke_date: data.stroke_date || null,
      stroke_sequelae: data.stroke_sequelae || null,
      pad: data.pad || false,
      pad_severity: data.pad_severity || null,
      pad_treatment: data.pad_treatment || null,
      other_comorbidities: data.other_comorbidities || false,
      other_comorbidities_details: data.other_comorbidities_details || null,
      chest_pain: data.chest_pain || false,
      chest_pain_characteristics: data.chest_pain_characteristics || null,
      chest_pain_duration: data.chest_pain_duration || null,
      chest_pain_radiation: data.chest_pain_radiation || null,
      dyspnea: data.dyspnea || false,
      dyspnea_class: data.dyspnea_class || null,
      syncope: data.syncope || false,
      syncope_frequency: data.syncope_frequency || null,
      palpitations: data.palpitations || false,
      palpitations_characteristics: data.palpitations_characteristics || null,
      edema: data.edema || false,
      edema_location: data.edema_location || null,
      edema_intensity: data.edema_intensity || null,
      medications: data.medications || [],
      antiplatelets: data.antiplatelets || false,
      aas: data.aas || false,
      clopidogrel: data.clopidogrel || false,
      ticagrelor: data.ticagrelor || false,
      prasugrel: data.prasugrel || false,
      anticoagulants: data.anticoagulants || false,
      warfarin: data.warfarin || false,
      dabigatran: data.dabigatran || false,
      rivaroxaban: data.rivaroxaban || false,
      apixaban: data.apixaban || false,
      edoxaban: data.edoxaban || false,
      doctor_name: data.doctor_name || null,
      doctor_crm: data.doctor_crm || null,
    };

    const { data: result, error } = await supabase
      .from('anamnesis')
      .insert(insertData)
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
