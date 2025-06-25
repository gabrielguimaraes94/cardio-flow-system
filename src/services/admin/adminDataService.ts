import { supabase } from '@/integrations/supabase/client';
import { AdminUser, AdminClinic } from './types';

export const getAllProfiles = async () => {
  try {
    console.log('=== BUSCANDO TODOS OS PROFILES (ADMIN) ===');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar profiles:', error);
      throw error;
    }
    
    console.log('✅ Profiles encontrados:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro no serviço de profiles:', error);
    throw error;
  }
};

export const getAllClinics = async () => {
  try {
    console.log('=== BUSCANDO TODAS AS CLÍNICAS (ADMIN) ===');
    
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar clínicas:', error);
      throw error;
    }
    
    console.log('✅ Clínicas encontradas:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro no serviço de clínicas:', error);
    throw error;
  }
};

export const getAllClinicStaff = async () => {
  try {
    console.log('=== BUSCANDO TODOS OS CLINIC_STAFF (ADMIN) ===');
    
    const { data, error } = await supabase
      .from('clinic_staff')
      .select(`
        *,
        profiles:user_id (
          id,
          first_name,
          last_name,
          email,
          role
        ),
        clinics:clinic_id (
          id,
          name,
          city
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar clinic_staff:', error);
      throw error;
    }
    
    console.log('✅ Clinic staff encontrados:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro no serviço de clinic_staff:', error);
    throw error;
  }
};

export const getAllPatients = async () => {
  try {
    console.log('=== BUSCANDO TODOS OS PACIENTES (ADMIN) ===');
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar pacientes:', error);
      throw error;
    }
    
    console.log('✅ Pacientes encontrados:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro no serviço de pacientes:', error);
    throw error;
  }
};

export const createRecord = async (tableName: string, data: any) => {
  try {
    console.log(`=== CRIANDO REGISTRO NA TABELA: ${tableName} ===`);
    console.log('Dados:', data);
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([data])
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Erro ao criar registro em ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Registro criado em ${tableName}:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Erro no serviço de criação ${tableName}:`, error);
    throw error;
  }
};

export const updateRecord = async (tableName: string, id: string, data: any) => {
  try {
    console.log(`=== ATUALIZANDO REGISTRO NA TABELA: ${tableName} ===`);
    console.log('ID:', id);
    console.log('Dados:', data);
    
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Erro ao atualizar registro em ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Registro atualizado em ${tableName}:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Erro no serviço de atualização ${tableName}:`, error);
    throw error;
  }
};

export const deleteRecord = async (tableName: string, id: string) => {
  try {
    console.log(`=== DELETANDO REGISTRO NA TABELA: ${tableName} ===`);
    console.log('ID:', id);
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`❌ Erro ao deletar registro em ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Registro deletado em ${tableName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro no serviço de deleção ${tableName}:`, error);
    throw error;
  }
};