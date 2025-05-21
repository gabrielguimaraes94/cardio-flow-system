
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Schema para validação dos dados do paciente
export const patientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  birthdate: z.string().or(z.date()),
  gender: z.string().min(1, { message: 'Gênero é obrigatório' }),
  cpf: z.string().min(1, { message: 'CPF é obrigatório' }),
  rg: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email({ message: 'Email inválido' }).nullable().optional(),
  clinic_id: z.string().uuid(),
});

// Tipo do paciente inferido do schema
export type Patient = z.infer<typeof patientSchema>;

// Schema para o endereço do paciente
export const patientAddressSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  cep: z.string().min(1, { message: 'CEP é obrigatório' }),
  street: z.string().min(1, { message: 'Endereço é obrigatório' }),
  number: z.string().min(1, { message: 'Número é obrigatório' }),
  complement: z.string().nullable().optional(),
  neighborhood: z.string().min(1, { message: 'Bairro é obrigatório' }),
  city: z.string().min(1, { message: 'Cidade é obrigatória' }),
  state: z.string().min(1, { message: 'Estado é obrigatório' }),
});

// Tipo do endereço do paciente inferido do schema
export type PatientAddress = z.infer<typeof patientAddressSchema>;

/**
 * Serviço para gerenciar operações relacionadas aos pacientes
 */
export const patientService = {
  /**
   * Busca os dados de um paciente pelo ID
   * @param patientId - ID do paciente
   * @returns Os dados do paciente e seu endereço
   */
  async getPatientById(patientId: string): Promise<{ patient: Patient | null; address: PatientAddress | null }> {
    try {
      // Buscar dados do paciente
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) {
        console.error('Erro ao buscar paciente:', patientError);
        throw patientError;
      }

      // Buscar endereço do paciente
      const { data: addressData, error: addressError } = await supabase
        .from('patient_addresses')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (addressError && addressError.code !== 'PGRST116') { // Ignora erro "no rows found"
        console.error('Erro ao buscar endereço do paciente:', addressError);
        throw addressError;
      }

      return {
        patient: patientData,
        address: addressData
      };
    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error);
      return { patient: null, address: null };
    }
  },

  /**
   * Atualiza os dados de um paciente
   * @param patientId - ID do paciente
   * @param patientData - Novos dados do paciente
   * @param addressData - Novos dados do endereço do paciente
   * @returns Sucesso ou falha na operação
   */
  async updatePatient(
    patientId: string,
    patientData: Omit<Patient, 'id' | 'clinic_id'>,
    addressData: Omit<PatientAddress, 'id' | 'patient_id'>
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Atualizar dados do paciente
      const { error: patientError } = await supabase
        .from('patients')
        .update({
          name: patientData.name,
          birthdate: new Date(patientData.birthdate).toISOString().split('T')[0],
          gender: patientData.gender,
          cpf: patientData.cpf,
          rg: patientData.rg || null,
          phone: patientData.phone || null,
          email: patientData.email || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (patientError) throw patientError;

      // Verificar se endereço existe
      const { data: existingAddress } = await supabase
        .from('patient_addresses')
        .select('id')
        .eq('patient_id', patientId)
        .single();

      if (existingAddress) {
        // Atualizar endereço existente
        const { error: addressError } = await supabase
          .from('patient_addresses')
          .update({
            cep: addressData.cep,
            street: addressData.street,
            number: addressData.number,
            complement: addressData.complement || null,
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state,
            updated_at: new Date().toISOString()
          })
          .eq('patient_id', patientId);

        if (addressError) throw addressError;
      } else {
        // Criar novo endereço
        const { error: addressError } = await supabase
          .from('patient_addresses')
          .insert({
            patient_id: patientId,
            cep: addressData.cep,
            street: addressData.street,
            number: addressData.number,
            complement: addressData.complement || null,
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state
          });

        if (addressError) throw addressError;
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      return { success: false, error };
    }
  }
};
