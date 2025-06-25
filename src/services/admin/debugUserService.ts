import { supabase } from '@/integrations/supabase/client';
import { getTableData, getAllProfiles, getAllClinics, getAllClinicStaff } from './adminDataService';

export const debugUserConsistency = async () => {
  console.log('=== DEBUG COMPLETO DE USUÁRIOS (NOVA VERSÃO) ===');
  
  try {
    // 1. Verificar usuários no auth.users
    console.log('1. VERIFICANDO AUTH.USERS...');
    const { data: authUsers, error: authError } = await supabase
      .rpc('debug_get_auth_users');
    
    if (authError) {
      console.error('❌ Erro ao buscar auth users:', authError);
    } else {
      console.log(`✅ Total de usuários auth: ${authUsers?.length || 0}`);
      console.log('📋 Primeiros 3 usuários auth:', authUsers?.slice(0, 3));
    }

    // 2. Verificar profiles usando novo serviço
    console.log('2. VERIFICANDO PROFILES (NOVO SERVIÇO)...');
    try {
      const profiles = await getAllProfiles();
      console.log(`✅ Total de profiles: ${profiles?.length || 0}`);
      console.log('📋 Primeiros 3 profiles:', profiles?.slice(0, 3));
    } catch (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
    }

    // 3. Verificar usuário atual e suas permissões
    console.log('3. VERIFICANDO USUÁRIO ATUAL...');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('👤 Usuário atual:', user.id);
      console.log('📧 Email:', user.email);
      
      // Testar função get_current_user_role
      const { data: roleFromFunction, error: roleError } = await supabase
        .rpc('get_current_user_role');
      
      if (roleError) {
        console.error('❌ Erro ao chamar get_current_user_role:', roleError);
      } else {
        console.log('🔧 Role via função:', roleFromFunction);
      }
    }

    // 4. Verificar clínicas usando novo serviço
    console.log('4. VERIFICANDO CLÍNICAS (NOVO SERVIÇO)...');
    try {
      const clinics = await getAllClinics();
      console.log(`✅ Total de clínicas: ${clinics?.length || 0}`);
      console.log('📋 Clínicas encontradas:', clinics?.slice(0, 3));
    } catch (clinicsError) {
      console.error('❌ Erro ao buscar clínicas:', clinicsError);
    }

    // 5. Verificar clinic_staff usando novo serviço
    console.log('5. VERIFICANDO CLINIC_STAFF (NOVO SERVIÇO)...');
    try {
      const clinicStaff = await getAllClinicStaff();
      console.log(`✅ Total de clinic_staff: ${clinicStaff?.length || 0}`);
      console.log('📋 Clinic staff encontrado:', clinicStaff?.slice(0, 3));
    } catch (staffError) {
      console.error('❌ Erro ao buscar clinic_staff:', staffError);  
    }

    // 6. Testar função genérica para várias tabelas
    console.log('6. TESTANDO FUNÇÃO GENÉRICA...');
    const tablesToTest = ['profiles', 'clinics', 'clinic_staff', 'patients'];
    
    for (const table of tablesToTest) {
      try {
        console.log(`6.${tablesToTest.indexOf(table) + 1}. Testando tabela ${table}...`);
        const data = await getTableData(table, 5);
        console.log(`✅ ${table}: ${data?.length || 0} registros`);
      } catch (error) {
        console.error(`❌ Erro na tabela ${table}:`, error);
      }
    }

  } catch (error) {
    console.error('❌ ERRO GERAL no debug:', error);
  }
};

export const debugAuthUsers = async () => {
  try {
    console.log('=== TESTANDO FUNÇÃO DEBUG_GET_AUTH_USERS ===');
    
    const { data, error } = await supabase.rpc('debug_get_auth_users');
    
    if (error) {
      console.error('❌ Erro na função debug_get_auth_users:', error);
      return { authUsers: [], error };
    }
    
    console.log('✅ Função debug_get_auth_users funcionou!');
    console.log('Auth users retornados:', data?.length || 0);
    
    data?.forEach((user, index) => {
      console.log(`Auth User ${index + 1}:`, {
        id: user.auth_user_id,
        email: user.auth_email,
        created_at: user.auth_created_at,
        has_profile: user.has_profile
      });
    });
    
    return { authUsers: data || [], error: null };
    
  } catch (error) {
    console.error('❌ Erro ao executar debug_get_auth_users:', error);
    return { authUsers: [], error };
  }
};

export const syncMissingProfiles = async () => {
  try {
    console.log('=== SINCRONIZANDO PROFILES FALTANTES ===');
    
    const { data, error } = await supabase.rpc('sync_missing_profiles');
    
    if (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
    
    console.log('✅ Sincronização concluída!');
    console.log('Profiles sincronizados:', data?.length || 0);
    
    data?.forEach((syncedUser, index) => {
      console.log(`Profile sincronizado ${index + 1}:`, {
        user_id: syncedUser.synced_user_id,
        email: syncedUser.synced_email,
        action: syncedUser.action_taken
      });
    });
    
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro na sincronização de profiles:', error);
    throw error;
  }
};

export const getClinicStaffData = async () => {
  try {
    console.log('=== BUSCANDO DADOS DE CLINIC_STAFF ===');
    
    const { data, error } = await supabase
      .from('clinic_staff')
      .select(`
        *,
        clinics:clinic_id(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar clinic staff:', error);
      console.error('Detalhes:', JSON.stringify(error, null, 2));
      return { clinicStaff: [], error };
    }
    
    console.log('✅ Clinic staff encontrados:', data?.length || 0);
    console.log('📋 Dados detalhados:', data);
    
    const mappedData = data?.map(staff => ({
      ...staff,
      clinic_name: staff.clinics?.name || 'N/A'
    })) || [];
    
    return { clinicStaff: mappedData, error: null };
    
  } catch (error) {
    console.error('❌ Erro ao buscar clinic staff:', error);
    return { clinicStaff: [], error };
  }
};

// Nova função para testar permissões específicas
export const testPermissions = async () => {
  try {
    console.log('=== TESTANDO PERMISSÕES ESPECÍFICAS ===');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ Usuário não autenticado');
      return;
    }
    
    console.log('👤 Testando para usuário:', user.id, user.email);
    
    // 1. Testar função get_current_user_role
    console.log('1. Testando get_current_user_role...');
    const { data: role, error: roleError } = await supabase.rpc('get_current_user_role');
    
    if (roleError) {
      console.error('❌ Erro get_current_user_role:', roleError);
    } else {
      console.log('✅ Role atual:', role);
    }
    
    // 2. Verificar profile diretamente
    console.log('2. Verificando profile diretamente...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar profile:', profileError);
    } else {
      console.log('✅ Profile encontrado:', profile);
    }
    
    // 3. Testar consulta às clínicas com logs detalhados
    console.log('3. Testando consulta às clínicas...');
    const { data: clinicsTest, error: clinicsTestError } = await supabase
      .from('clinics')
      .select('id, name, active, created_by')
      .limit(5);
    
    if (clinicsTestError) {
      console.error('❌ Erro ao testar clínicas:', clinicsTestError);
    } else {
      console.log('✅ Clínicas no teste:', clinicsTest);
    }
    
    // 4. Testar consulta ao clinic_staff com logs detalhados
    console.log('4. Testando consulta ao clinic_staff...');
    const { data: staffTest, error: staffTestError } = await supabase
      .from('clinic_staff')
      .select('id, user_id, clinic_id, is_admin, active, role')
      .limit(5);
    
    if (staffTestError) {
      console.error('❌ Erro ao testar clinic_staff:', staffTestError);
    } else {
      console.log('✅ Clinic staff no teste:', staffTest);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste de permissões:', error);
  }
};
