
import { supabase } from '@/integrations/supabase/client';

// Serviço genérico para admin buscar dados de qualquer tabela
export const getTableData = async (tableName: string, limit = 100) => {
  try {
    console.log(`=== BUSCANDO DADOS DA TABELA: ${tableName} ===`);
    
    const { data, error } = await supabase.rpc('admin_get_table_data', {
      table_name: tableName,
      limit_count: limit
    });
    
    if (error) {
      console.error(`Erro ao buscar dados da tabela ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Dados da tabela ${tableName}:`, data?.length || 0, 'registros');
    return data || [];
    
  } catch (error) {
    console.error(`❌ Erro ao buscar tabela ${tableName}:`, error);
    throw error;
  }
};

// Funções específicas para cada tabela usando acesso direto
export const getAllProfiles = async () => {
  try {
    console.log('=== BUSCANDO TODOS OS PROFILES (ADMIN) ===');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar profiles:', error);
      throw error;
    }
    
    console.log(`✅ Profiles encontrados: ${data?.length || 0}`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro ao buscar profiles:', error);
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
      console.error('Erro ao buscar clínicas:', error);
      throw error;
    }
    
    console.log(`✅ Clínicas encontradas: ${data?.length || 0}`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro ao buscar clínicas:', error);
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
        clinics:clinic_id(name),
        profiles:user_id(first_name, last_name, email, crm)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar clinic_staff:', error);
      throw error;
    }
    
    console.log(`✅ Clinic staff encontrados: ${data?.length || 0}`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro ao buscar clinic_staff:', error);
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
      console.error('Erro ao buscar pacientes:', error);
      throw error;
    }
    
    console.log(`✅ Pacientes encontrados: ${data?.length || 0}`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes:', error);
    throw error;
  }
};

// Função para criar registros em qualquer tabela (apenas admin)
export const createRecord = async (tableName: string, data: Record<string, any>) => {
  try {
    console.log(`=== CRIANDO REGISTRO NA TABELA: ${tableName} ===`);
    console.log('Dados:', data);
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`Erro ao criar registro em ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Registro criado em ${tableName}:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Erro ao criar registro em ${tableName}:`, error);
    throw error;
  }
};

// Função para atualizar registros em qualquer tabela (apenas admin)
export const updateRecord = async (tableName: string, id: string, data: Record<string, any>) => {
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
      console.error(`Erro ao atualizar registro em ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Registro atualizado em ${tableName}:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Erro ao atualizar registro em ${tableName}:`, error);
    throw error;
  }
};

// Função para deletar registros em qualquer tabela (apenas admin)
export const deleteRecord = async (tableName: string, id: string) => {
  try {
    console.log(`=== DELETANDO REGISTRO NA TABELA: ${tableName} ===`);
    console.log('ID:', id);
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao deletar registro em ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Registro deletado em ${tableName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro ao deletar registro em ${tableName}:`, error);
    throw error;
  }
};
