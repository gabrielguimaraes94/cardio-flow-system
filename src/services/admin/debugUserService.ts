
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
    
    // 5. Tentar buscar usuários diretamente do auth (se possível via RPC)
    console.log('🔐 Tentando verificar tabela auth.users via RPC...');
    
    // Como não podemos acessar auth.users diretamente, vamos criar uma RPC function
    const { data: authUsers, error: authError } = await supabase
      .rpc('debug_get_auth_users');
    
    if (authError) {
      console.log('⚠️ Não foi possível acessar auth.users via RPC:', authError.message);
    } else {
      console.log('🔐 USUÁRIOS AUTH.USERS:', authUsers);
    }
    
  } catch (error) {
    console.error('❌ Erro no debug de consistência:', error);
  }
};
