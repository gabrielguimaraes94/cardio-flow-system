
import { supabase } from '@/integrations/supabase/client';

export const debugUserConsistency = async () => {
  try {
    console.log('=== DEBUG: VERIFICANDO CONSISTÊNCIA USUÁRIOS ===');
    
    // 1. Buscar todos os profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, created_at');
    
    if (profilesError) {
      console.error('Erro ao buscar profiles:', profilesError);
      return;
    }
    
    console.log('📋 PROFILES ENCONTRADOS:');
    console.log(`Total de profiles: ${profiles?.length || 0}`);
    profiles?.forEach((profile, index) => {
      console.log(`Profile ${index + 1}:`, {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        role: profile.role,
        created_at: profile.created_at
      });
    });
    
    // 2. Buscar usuários na tabela clinic_staff
    const { data: clinicStaff, error: staffError } = await supabase
      .from('clinic_staff')
      .select('user_id, role, clinic_id, is_admin, active');
    
    if (staffError) {
      console.error('Erro ao buscar clinic_staff:', staffError);
    } else {
      console.log('👥 CLINIC STAFF ENCONTRADOS:');
      console.log(`Total de registros clinic_staff: ${clinicStaff?.length || 0}`);
      clinicStaff?.forEach((staff, index) => {
        console.log(`Staff ${index + 1}:`, {
          user_id: staff.user_id,
          role: staff.role,
          clinic_id: staff.clinic_id,
          is_admin: staff.is_admin,
          active: staff.active
        });
      });
      
      // 3. Verificar se todos os users do clinic_staff têm profile
      console.log('🔍 VERIFICANDO CONSISTÊNCIA:');
      const staffUserIds = clinicStaff?.map(s => s.user_id) || [];
      const profileIds = profiles?.map(p => p.id) || [];
      
      const missingProfiles = staffUserIds.filter(id => !profileIds.includes(id));
      const orphanProfiles = profileIds.filter(id => !staffUserIds.includes(id));
      
      if (missingProfiles.length > 0) {
        console.log('❌ USUÁRIOS SEM PROFILE:', missingProfiles);
      }
      
      if (orphanProfiles.length > 0) {
        console.log('⚠️ PROFILES SEM CLINIC_STAFF:', orphanProfiles);
      }
      
      if (missingProfiles.length === 0 && orphanProfiles.length === 0) {
        console.log('✅ Todos os usuários têm profiles correspondentes');
      }
    }
    
    // 4. Verificar clínicas criadas
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id, name, created_by');
    
    if (!clinicsError && clinics) {
      console.log('🏥 CLÍNICAS CRIADAS:');
      console.log(`Total de clínicas: ${clinics.length}`);
      clinics.forEach((clinic, index) => {
        console.log(`Clínica ${index + 1}:`, {
          id: clinic.id,
          name: clinic.name,
          created_by: clinic.created_by
        });
      });
    }
    
    // 5. Verificar usuários por role
    console.log('👤 ANÁLISE POR ROLE:');
    const roleCount: Record<string, number> = {};
    profiles?.forEach(profile => {
      roleCount[profile.role] = (roleCount[profile.role] || 0) + 1;
    });
    
    console.log('Contagem por role:', roleCount);
    
    // 6. Verificar possíveis problemas
    console.log('🔧 POSSÍVEIS PROBLEMAS:');
    
    if (profiles && profiles.length === 1 && profiles[0].role === 'admin') {
      console.log('⚠️ PROBLEMA IDENTIFICADO: Apenas 1 usuário admin encontrado');
      console.log('Isso indica que:');
      console.log('1. Novos usuários podem não estar sendo criados corretamente');
      console.log('2. Trigger handle_new_user pode não estar funcionando');
      console.log('3. Usuários podem estar sendo criados apenas na tabela auth.users');
      console.log('4. RLS pode estar bloqueando a visualização');
    }
    
    // 7. Verificar RLS policies
    console.log('🔒 VERIFICANDO RLS:');
    console.log('Para verificar se RLS está bloqueando, execute no SQL Editor:');
    console.log('SELECT * FROM profiles;');
    console.log('Se retornar mais registros que aqui, RLS está bloqueando alguns dados');
    
  } catch (error) {
    console.error('❌ Erro no debug de consistência:', error);
  }
};

export const syncMissingProfiles = async () => {
  try {
    console.log('=== SINCRONIZANDO PROFILES FALTANTES ===');
    
    const { data, error } = await supabase
      .rpc('sync_missing_profiles');
    
    if (error) {
      console.error('❌ Erro ao sincronizar profiles:', error);
      throw error;
    }
    
    console.log('✅ SINCRONIZAÇÃO CONCLUÍDA');
    console.log('Profiles sincronizados:', data);
    
    if (data && data.length > 0) {
      console.log(`📊 RESUMO: ${data.length} profiles foram criados`);
      data.forEach((profile: any, index: number) => {
        console.log(`Profile ${index + 1}:`, {
          user_id: profile.synced_user_id,
          email: profile.synced_email,
          action: profile.action_taken
        });
      });
    } else {
      console.log('ℹ️ Nenhum profile precisou ser sincronizado');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro na sincronização de profiles:', error);
    throw error;
  }
};

export const debugAuthUsers = async () => {
  try {
    console.log('=== DEBUG: VERIFICANDO USUÁRIOS AUTH ===');
    
    const { data: authUsers, error: authError } = await supabase
      .rpc('debug_get_auth_users');
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários auth:', authError);
      return;
    }
    
    console.log('🔐 USUÁRIOS AUTH.USERS:');
    console.log(`Total de usuários auth: ${authUsers?.length || 0}`);
    
    authUsers?.forEach((user: any, index: number) => {
      console.log(`Auth User ${index + 1}:`, {
        id: user.auth_user_id,
        email: user.auth_email,
        created_at: user.auth_created_at,
        has_profile: user.has_profile
      });
    });
    
    // Identificar usuários sem profile
    const usersWithoutProfile = authUsers?.filter((user: any) => !user.has_profile) || [];
    
    if (usersWithoutProfile.length > 0) {
      console.log('❌ USUÁRIOS SEM PROFILE:');
      usersWithoutProfile.forEach((user: any, index: number) => {
        console.log(`Usuário sem profile ${index + 1}:`, {
          id: user.auth_user_id,
          email: user.auth_email,
          created_at: user.auth_created_at
        });
      });
      
      console.log('💡 SOLUÇÃO: Execute a sincronização de profiles para corrigir isso');
    } else {
      console.log('✅ Todos os usuários auth têm profiles correspondentes');
    }
    
    return authUsers;
    
  } catch (error) {
    console.error('❌ Erro no debug de usuários auth:', error);
    throw error;
  }
};
