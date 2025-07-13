
import { supabase } from '@/integrations/supabase/client';

export const runFullDiagnostic = async () => {
  console.log('=== DIAGNÓSTICO COMPLETO DO SISTEMA ===');
  
  try {
    // 1. Verificar inconsistências entre auth.users e profiles
    console.log('1. VERIFICANDO INCONSISTÊNCIAS AUTH vs PROFILES...');
    const { data: authUsers, error: authError } = await supabase.rpc('debug_get_auth_users');
    
    if (authError) {
      console.error('❌ Erro ao buscar auth users:', authError);
      return false;
    }
    
    console.log(`📊 Auth users: ${authUsers?.length || 0}`);
    
    // Separar usuários com e sem profile
    const usersWithProfile = authUsers?.filter(u => u.has_profile) || [];
    const usersWithoutProfile = authUsers?.filter(u => !u.has_profile) || [];
    
    console.log(`✅ Com profile: ${usersWithProfile.length}`);
    console.log(`❌ Sem profile: ${usersWithoutProfile.length}`);
    
    if (usersWithoutProfile.length > 0) {
      console.log('🚨 USUÁRIOS ÓRFÃOS (auth sem profile):');
      usersWithoutProfile.forEach(user => {
        console.log(`- ID: ${user.auth_user_id}, Email: ${user.auth_email}`);
      });
    }

    // 2. Verificar profiles órfãos
    console.log('2. VERIFICANDO PROFILES vs AUTH...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role');
    
    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
      return false;
    }
    
    console.log(`📊 Total profiles: ${profiles?.length || 0}`);
    
    // Verificar se todos os profiles têm auth users correspondentes
    const authUserIds = authUsers?.map(u => u.auth_user_id) || [];
    const orphanProfiles = profiles?.filter(p => !authUserIds.includes(p.id)) || [];
    
    if (orphanProfiles.length > 0) {
      console.log('🚨 PROFILES ÓRFÃOS (profile sem auth):');
      orphanProfiles.forEach(profile => {
        console.log(`- ID: ${profile.id}, Email: ${profile.email}`);
      });
    }

    // 3. Verificar clinic_staff inconsistente
    console.log('3. VERIFICANDO CLINIC_STAFF...');
    const { data: clinicStaff, error: staffError } = await supabase
      .from('clinic_staff')
      .select(`
        id,
        user_id,
        clinic_id,
        role,
        is_admin,
        active,
        clinics!inner(id, name),
        profiles!inner(id, email, first_name, last_name)
      `);
    
    if (staffError) {
      console.error('❌ Erro ao buscar clinic_staff:', staffError);
      console.error('Detalhes do erro:', JSON.stringify(staffError, null, 2));
    } else {
      console.log(`📊 Total clinic_staff: ${clinicStaff?.length || 0}`);
      
      // Verificar se há staff órfão
      const profileIds = profiles?.map(p => p.id) || [];
      const orphanStaff = clinicStaff?.filter(s => !profileIds.includes(s.user_id)) || [];
      
      if (orphanStaff.length > 0) {
        console.log('🚨 CLINIC_STAFF ÓRFÃO (staff sem profile):');
        orphanStaff.forEach(staff => {
          console.log(`- Staff ID: ${staff.id}, User ID: ${staff.user_id}`);
        });
      }
    }

    // 4. Verificar função get_user_clinics diretamente
    console.log('4. TESTANDO get_user_clinics...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: userClinics, error: clinicsError } = await supabase
        .rpc('get_user_clinics', { user_uuid: user.id });
      
      if (clinicsError) {
        console.error('❌ Erro na função get_user_clinics:', clinicsError);
      } else {
        console.log('📋 Resultado get_user_clinics:', userClinics);
        
        // Verificar dados estranhos
        const strangeData = userClinics?.filter(c => 
          c.staff_id === 'global-admin' || 
          !c.clinic_id || 
          !c.clinic_name
        ) || [];
        
        if (strangeData.length > 0) {
          console.log('🚨 DADOS ESTRANHOS em get_user_clinics:');
          strangeData.forEach(data => {
            console.log('- Dados:', data);
          });
        }
      }
    }

    // 5. Verificar clínicas
    console.log('5. VERIFICANDO CLÍNICAS...');
    const { data: clinics, error: clinicsErr } = await supabase
      .from('clinics')
      .select('id, name, created_by, active')
      .limit(20);
    
    if (clinicsErr) {
      console.error('❌ Erro ao buscar clínicas:', clinicsErr);
    } else {
      console.log(`📊 Total clínicas: ${clinics?.length || 0}`);
      
      // Verificar clínicas órfãs
      const orphanClinics = clinics?.filter(c => !authUserIds.includes(c.created_by)) || [];
      
      if (orphanClinics.length > 0) {
        console.log('🚨 CLÍNICAS ÓRFÃS (created_by não existe):');
        orphanClinics.forEach(clinic => {
          console.log(`- Clínica: ${clinic.name}, Created by: ${clinic.created_by}`);
        });
      }
    }

    console.log('=== DIAGNÓSTICO CONCLUÍDO ===');
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral no diagnóstico:', error);
    return false;
  }
};

export const cleanOrphanData = async () => {
  console.log('=== LIMPANDO DADOS ÓRFÃOS ===');
  
  try {
    // Verificar se é admin
    const { data: role } = await supabase.rpc('get_current_user_role');
    if (role !== 'admin') {
      console.error('❌ Apenas admins podem executar limpeza');
      return false;
    }
    
    // 1. Sincronizar profiles faltantes
    console.log('1. Sincronizando profiles...');
    const { data: syncResult, error: syncError } = await supabase.rpc('sync_missing_profiles');
    
    if (syncError) {
      console.error('❌ Erro na sincronização:', syncError);
    } else {
      console.log('✅ Profiles sincronizados:', syncResult?.length || 0);
    }
    
    // 2. Limpar clinic_staff órfão
    console.log('2. Limpando clinic_staff órfão...');
    const { error: cleanStaffError } = await supabase
      .from('clinic_staff')
      .delete()
      .not('user_id', 'in', `(SELECT id FROM profiles)`);
    
    if (cleanStaffError) {
      console.error('❌ Erro limpando clinic_staff:', cleanStaffError);
    } else {
      console.log('✅ Clinic_staff órfão removido');
    }
    
    // 3. Limpar clínicas órfãs
    console.log('3. Limpando clínicas órfãs...');
    const { error: cleanClinicsError } = await supabase
      .from('clinics')
      .delete()
      .not('created_by', 'in', `(SELECT id FROM auth.users)`);
    
    if (cleanClinicsError) {
      console.error('❌ Erro limpando clínicas:', cleanClinicsError);
    } else {
      console.log('✅ Clínicas órfãs removidas');
    }
    
    console.log('=== LIMPEZA CONCLUÍDA ===');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    return false;
  }
};
