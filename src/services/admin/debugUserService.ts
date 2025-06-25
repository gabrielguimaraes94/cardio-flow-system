import { supabase } from '@/integrations/supabase/client';

export const debugUserConsistency = async () => {
  console.log('=== DEBUG COMPLETO DE USUÁRIOS ===');
  
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

    // 2. Verificar profiles
    console.log('2. VERIFICANDO PROFILES...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
    } else {
      console.log(`✅ Total de profiles: ${profiles?.length || 0}`);
      console.log('📋 Primeiros 3 profiles:', profiles?.slice(0, 3));
    }

    // 3. Verificar clínicas - MELHORADA
    console.log('3. VERIFICANDO CLÍNICAS...');
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (clinicsError) {
      console.error('❌ Erro ao buscar clínicas:', clinicsError);
      console.error('Detalhes do erro:', JSON.stringify(clinicsError, null, 2));
    } else {
      console.log(`✅ Total de clínicas: ${clinics?.length || 0}`);
      console.log('📋 Clínicas encontradas:', clinics);
    }

    // 4. Verificar clinic_staff - MELHORADA
    console.log('4. VERIFICANDO CLINIC_STAFF...');
    const { data: clinicStaff, error: staffError } = await supabase
      .from('clinic_staff')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (staffError) {
      console.error('❌ Erro ao buscar clinic_staff:', staffError);
      console.error('Detalhes do erro:', JSON.stringify(staffError, null, 2));
    } else {
      console.log(`✅ Total de clinic_staff: ${clinicStaff?.length || 0}`);
      console.log('📋 Clinic staff encontrado:', clinicStaff);
    }

    // 5. Verificar usuário atual
    console.log('5. VERIFICANDO USUÁRIO ATUAL...');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('👤 Usuário atual:', user.id);
      console.log('📧 Email:', user.email);
      
      // Verificar role do usuário atual
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('🔑 Role do usuário atual:', currentUserProfile?.role);
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
      return { clinicStaff: [], error };
    }
    
    console.log('✅ Clinic staff encontrados:', data?.length || 0);
    
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
