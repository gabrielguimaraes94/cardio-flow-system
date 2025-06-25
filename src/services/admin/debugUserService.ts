
import { supabase } from '@/integrations/supabase/client';

export const debugUserConsistency = async () => {
  try {
    console.log('=== DEBUG COMPLETO DE USUÁRIOS ===');
    
    // 1. Verificar profiles
    console.log('📋 VERIFICANDO PROFILES...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Profiles encontrados:', profiles?.length || 0);
    if (profilesError) {
      console.error('Erro ao buscar profiles:', profilesError);
    } else {
      profiles?.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          role: profile.role
        });
      });
    }
    
    // 2. Verificar clinic_staff
    console.log('👥 VERIFICANDO CLINIC_STAFF...');
    const { data: clinicStaff, error: staffError } = await supabase
      .from('clinic_staff')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Clinic staff encontrados:', clinicStaff?.length || 0);
    if (staffError) {
      console.error('Erro ao buscar clinic staff:', staffError);
    } else {
      clinicStaff?.forEach((staff, index) => {
        console.log(`Staff ${index + 1}:`, {
          id: staff.id,
          user_id: staff.user_id,
          clinic_id: staff.clinic_id,
          role: staff.role,
          is_admin: staff.is_admin,
          active: staff.active
        });
      });
    }
    
    // 3. Verificar clínicas
    console.log('🏥 VERIFICANDO CLÍNICAS...');
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Clínicas encontradas:', clinics?.length || 0);
    if (clinicsError) {
      console.error('Erro ao buscar clínicas:', clinicsError);
    } else {
      clinics?.forEach((clinic, index) => {
        console.log(`Clínica ${index + 1}:`, {
          id: clinic.id,
          name: clinic.name,
          city: clinic.city,
          active: clinic.active,
          created_by: clinic.created_by
        });
      });
    }
    
    // 4. Tentar buscar auth users agora que a função foi corrigida
    console.log('🔐 VERIFICANDO AUTH USERS...');
    try {
      const { data: authUsers, error: authError } = await supabase
        .rpc('debug_get_auth_users');
      
      if (authError) {
        console.error('Erro ao buscar auth users:', authError);
      } else {
        console.log('Auth users encontrados:', authUsers?.length || 0);
        authUsers?.forEach((user, index) => {
          console.log(`Auth User ${index + 1}:`, {
            id: user.auth_user_id,
            email: user.auth_email,
            created_at: user.auth_created_at,
            has_profile: user.has_profile
          });
        });
      }
    } catch (error) {
      console.error('Erro na função debug_get_auth_users:', error);
    }
    
    // 5. Resumo final
    console.log('=== RESUMO DO DEBUG ===');
    console.log(`✅ Profiles: ${profiles?.length || 0}`);
    console.log(`✅ Clinic Staff: ${clinicStaff?.length || 0}`);
    console.log(`✅ Clínicas: ${clinics?.length || 0}`);
    console.log('🎉 Debug completo finalizado!');
    
    return {
      profiles: profiles || [],
      clinicStaff: clinicStaff || [],
      clinics: clinics || [],
      success: true
    };
    
  } catch (error) {
    console.error('❌ ERRO GERAL no debug:', error);
    return {
      profiles: [],
      clinicStaff: [],
      clinics: [],
      success: false,
      error
    };
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
