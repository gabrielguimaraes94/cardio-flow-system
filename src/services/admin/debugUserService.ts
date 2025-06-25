
import { supabase } from '@/integrations/supabase/client';

export const debugUserConsistency = async () => {
  try {
    console.log('=== DEBUG: VERIFICAÇÃO COMPLETA DO SISTEMA ===');
    
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
    
    // 6. Análise passo a passo do fluxo
    console.log('🔄 ANÁLISE PASSO A PASSO DO FLUXO:');
    await analyzeUserCreationFlow();
    
  } catch (error) {
    console.error('❌ Erro no debug de consistência:', error);
  }
};

const analyzeUserCreationFlow = async () => {
  console.log('🔍 ANÁLISE DETALHADA DO FLUXO DE CRIAÇÃO DE USUÁRIOS:');
  
  // Passo 1: Verificar trigger handle_new_user
  console.log('\n📝 PASSO 1: VERIFICANDO TRIGGER handle_new_user');
  console.log('Possíveis erros:');
  console.log('❌ 1.1: Trigger não existe ou está desabilitado');
  console.log('❌ 1.2: Função handle_new_user() tem erro de sintaxe');
  console.log('❌ 1.3: Permissões insuficientes para executar o trigger');
  
  // Passo 2: Verificar auth.users vs profiles
  console.log('\n👤 PASSO 2: VERIFICANDO SINCRONIZAÇÃO AUTH.USERS → PROFILES');
  try {
    const { data: authUsers } = await supabase.rpc('debug_get_auth_users');
    const { data: profiles } = await supabase.from('profiles').select('id');
    
    const authUserIds = authUsers?.map((u: any) => u.auth_user_id) || [];
    const profileIds = profiles?.map(p => p.id) || [];
    
    const missingProfiles = authUserIds.filter(id => !profileIds.includes(id));
    
    if (missingProfiles.length > 0) {
      console.log('❌ 2.1: Usuários em auth.users sem profile correspondente:', missingProfiles);
      console.log('❌ 2.2: Trigger handle_new_user não está funcionando');
      console.log('❌ 2.3: RLS está bloqueando a criação de profiles');
    } else {
      console.log('✅ 2: Todos os usuários auth têm profiles');
    }
  } catch (error) {
    console.error('❌ 2: Erro ao verificar auth.users:', error);
  }
  
  // Passo 3: Verificar fluxo admin → admin de clínica
  console.log('\n🏥 PASSO 3: VERIFICANDO FLUXO ADMIN GLOBAL → ADMIN CLÍNICA');
  console.log('Fluxo esperado:');
  console.log('1. Admin global cria clínica');
  console.log('2. Admin global registra usuário como admin da clínica');
  console.log('3. Usuário recebe convite/credenciais');
  console.log('4. Usuário faz primeiro login');
  console.log('5. Profile é criado automaticamente');
  console.log('6. Relação clinic_staff é estabelecida');
  
  console.log('Possíveis erros:');
  console.log('❌ 3.1: Admin global não tem permissões para criar clínicas');
  console.log('❌ 3.2: Processo de registro de admin de clínica falha');
  console.log('❌ 3.3: Email de convite não é enviado/recebido');
  
  // Passo 4: Verificar fluxo admin clínica → funcionários
  console.log('\n👥 PASSO 4: VERIFICANDO FLUXO ADMIN CLÍNICA → FUNCIONÁRIOS');
  console.log('Fluxo esperado:');
  console.log('1. Admin de clínica acessa área de gestão');
  console.log('2. Admin de clínica cadastra novo funcionário');
  console.log('3. Sistema cria usuário no auth.users');
  console.log('4. Trigger cria profile automaticamente');
  console.log('5. Sistema cria relação clinic_staff');
  console.log('6. Funcionário recebe credenciais');
  
  console.log('Possíveis erros:');
  console.log('❌ 4.1: Admin de clínica não tem permissões corretas');
  console.log('❌ 4.2: Falha na criação do usuário no auth.users');
  console.log('❌ 4.3: Trigger handle_new_user falha ao criar profile');
  
  // Passo 5: Verificar RLS policies
  console.log('\n🔒 PASSO 5: VERIFICANDO POLÍTICAS RLS');
  console.log('Possíveis erros:');
  console.log('❌ 5.1: RLS muito restritivo impedindo visualização');
  console.log('❌ 5.2: RLS impedindo criação de profiles');
  console.log('❌ 5.3: RLS impedindo criação de clinic_staff');
  
  // Passo 6: Verificar permissões de função
  console.log('\n⚙️ PASSO 6: VERIFICANDO FUNÇÕES E PERMISSÕES');
  console.log('Possíveis erros:');
  console.log('❌ 6.1: Função is_global_admin() não funciona corretamente');
  console.log('❌ 6.2: Função is_clinic_admin() não funciona corretamente');
  console.log('❌ 6.3: Funções de criação (create_clinic, add_clinic_staff) com erro');
  
  console.log('\n💡 RECOMENDAÇÕES PARA INVESTIGAÇÃO:');
  console.log('1. Execute SELECT * FROM auth.users; no SQL Editor');
  console.log('2. Execute SELECT * FROM profiles; no SQL Editor');
  console.log('3. Execute SELECT * FROM clinic_staff; no SQL Editor');
  console.log('4. Verifique se o trigger on_auth_user_created existe');
  console.log('5. Teste criação manual de usuário no dashboard do Supabase');
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
      return { authUsers: [], error: authError };
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
    
    return { authUsers, error: null };
    
  } catch (error) {
    console.error('❌ Erro no debug de usuários auth:', error);
    return { authUsers: [], error };
  }
};

export const getClinicStaffData = async () => {
  try {
    console.log('=== BUSCANDO DADOS CLINIC_STAFF ===');
    
    const { data: clinicStaff, error } = await supabase
      .from('clinic_staff')
      .select(`
        id,
        user_id,
        clinic_id,
        role,
        is_admin,
        active,
        created_at,
        clinics (
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar clinic_staff:', error);
      return { clinicStaff: [], error };
    }
    
    console.log('👥 DADOS CLINIC_STAFF:');
    console.log(`Total de registros: ${clinicStaff?.length || 0}`);
    
    const formattedStaff = clinicStaff?.map(staff => ({
      ...staff,
      clinic_name: staff.clinics?.name || 'N/A'
    })) || [];
    
    return { clinicStaff: formattedStaff, error: null };
    
  } catch (error) {
    console.error('❌ Erro ao buscar clinic_staff:', error);
    return { clinicStaff: [], error };
  }
};
