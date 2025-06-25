
import { supabase } from '@/integrations/supabase/client';

export const debugUserConsistency = async () => {
  try {
    console.log('=== DEBUG: VERIFICAÇÃO COMPLETA DO SISTEMA ===');
    
    // 1. Buscar todos os profiles (limitado pelas políticas RLS)
    console.log('📋 VERIFICANDO PROFILES ACESSÍVEIS...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, created_at');
    
    if (profilesError) {
      console.error('Erro ao buscar profiles:', profilesError);
      console.log('⚠️ POSSÍVEL PROBLEMA: RLS pode estar bloqueando acesso aos profiles');
    } else {
      console.log('📋 PROFILES ENCONTRADOS:');
      console.log(`Total de profiles visíveis: ${profiles?.length || 0}`);
      profiles?.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          role: profile.role,
          created_at: profile.created_at
        });
      });
    }
    
    // 2. Buscar usuários na tabela clinic_staff
    console.log('👥 VERIFICANDO CLINIC_STAFF...');
    const { data: clinicStaff, error: staffError } = await supabase
      .from('clinic_staff')
      .select('user_id, role, clinic_id, is_admin, active, created_at');
    
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
          active: staff.active,
          created_at: staff.created_at
        });
      });
      
      // 3. Verificar consistência entre profiles e clinic_staff
      console.log('🔍 VERIFICANDO CONSISTÊNCIA:');
      const staffUserIds = clinicStaff?.map(s => s.user_id) || [];
      const profileIds = profiles?.map(p => p.id) || [];
      
      const missingProfiles = staffUserIds.filter(id => !profileIds.includes(id));
      const orphanProfiles = profileIds.filter(id => !staffUserIds.includes(id));
      
      if (missingProfiles.length > 0) {
        console.log('❌ USUÁRIOS SEM PROFILE:', missingProfiles);
        console.log('🔧 AÇÃO NECESSÁRIA: Execute sincronização de profiles');
      }
      
      if (orphanProfiles.length > 0) {
        console.log('⚠️ PROFILES SEM CLINIC_STAFF:', orphanProfiles);
        console.log('ℹ️ NOTA: Podem ser admins globais (normal)');
      }
      
      if (missingProfiles.length === 0 && orphanProfiles.length === 0) {
        console.log('✅ Todos os usuários têm profiles correspondentes');
      }
    }
    
    // 4. Verificar clínicas criadas
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id, name, created_by, created_at');
    
    if (!clinicsError && clinics) {
      console.log('🏥 CLÍNICAS CRIADAS:');
      console.log(`Total de clínicas: ${clinics.length}`);
      clinics.forEach((clinic, index) => {
        console.log(`Clínica ${index + 1}:`, {
          id: clinic.id,
          name: clinic.name,
          created_by: clinic.created_by,
          created_at: clinic.created_at
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
    
    // 6. Identificar problemas principais
    console.log('🔧 ANÁLISE DE PROBLEMAS:');
    
    if (profiles && profiles.length <= 1) {
      console.log('⚠️ PROBLEMA IDENTIFICADO: Apenas 1 usuário admin encontrado');
      console.log('Isso indica que:');
      console.log('1. Novos usuários podem não estar sendo criados corretamente');
      console.log('2. Trigger handle_new_user pode não estar funcionando');
      console.log('3. Usuários podem estar sendo criados apenas na tabela auth.users');
      console.log('4. RLS pode estar bloqueando a visualização');
    }
    
    // 7. Verificações de RLS
    console.log('🔒 PROBLEMAS DE PERMISSÃO IDENTIFICADOS:');
    console.log('1. ❌ Não conseguimos acessar auth.users (esperado - tabela protegida)');
    console.log('2. ❌ Não conseguimos acessar information_schema (esperado - requer privilégios especiais)');
    console.log('3. ⚠️ Profiles podem estar com RLS muito restritivo');
    
    // 8. Recomendações
    console.log('💡 RECOMENDAÇÕES PARA ADMIN:');
    console.log('1. Verifique no Supabase Dashboard > Authentication > Users');
    console.log('2. Execute as queries SQL no SQL Editor para ver dados completos');
    console.log('3. Verifique se o trigger on_auth_user_created existe');
    console.log('4. Considere ajustar políticas RLS para admin global');
    
    // 9. Análise do fluxo
    await analyzeUserCreationFlow();
    
  } catch (error) {
    console.error('❌ Erro no debug de consistência:', error);
  }
};

const analyzeUserCreationFlow = async () => {
  console.log('🔄 ANÁLISE DETALHADA DO FLUXO DE CRIAÇÃO:');
  
  console.log('\n📝 PASSO 1: VERIFICAÇÃO DO TRIGGER');
  console.log('❌ 1.1: Não conseguimos verificar se trigger existe via API');
  console.log('❌ 1.2: Precisamos verificar manualmente no SQL Editor');
  console.log('❌ 1.3: Função handle_new_user pode não existir ou estar mal configurada');
  
  console.log('\n👤 PASSO 2: VERIFICAÇÃO AUTH.USERS → PROFILES');
  console.log('❌ 2.1: Não temos acesso direto à tabela auth.users');
  console.log('❌ 2.2: RLS impede visualização de todos os profiles');
  console.log('❌ 2.3: Trigger pode não estar executando corretamente');
  
  console.log('\n🏥 PASSO 3: FLUXO ADMIN GLOBAL → ADMIN CLÍNICA');
  console.log('Fluxo esperado:');
  console.log('1. Admin global cria clínica');
  console.log('2. Admin global convida admin de clínica');
  console.log('3. Admin de clínica faz cadastro/login');
  console.log('4. Trigger cria profile automaticamente');
  console.log('5. Admin global adiciona relação clinic_staff');
  
  console.log('\n👥 PASSO 4: FLUXO ADMIN CLÍNICA → FUNCIONÁRIOS');
  console.log('Fluxo esperado:');
  console.log('1. Admin de clínica convida funcionário');
  console.log('2. Funcionário faz cadastro no sistema');
  console.log('3. Trigger cria profile automaticamente');
  console.log('4. Admin de clínica adiciona à equipe');
  
  console.log('\n🔧 PROBLEMAS IDENTIFICADOS:');
  console.log('❌ 4.1: Não há interface para admin criar usuários');
  console.log('❌ 4.2: Não há sistema de convites por email');
  console.log('❌ 4.3: Trigger pode não estar funcionando');
  console.log('❌ 4.4: RLS muito restritivo para visualização de dados');
  
  console.log('\n🚀 SOLUÇÕES RECOMENDADAS:');
  console.log('1. ✅ Verificar trigger no SQL Editor do Supabase');
  console.log('2. ✅ Ajustar políticas RLS para admin global');
  console.log('3. ✅ Implementar sistema de convites de usuários');
  console.log('4. ✅ Criar interface para gestão de usuários');
  console.log('5. ✅ Testar fluxo completo de criação de usuários');
  
  console.log('\n📋 QUERIES PARA EXECUTAR NO SQL EDITOR:');
  console.log(`
    -- 1. Verificar usuários auth vs profiles
    SELECT 
      'auth_users' as tabela, COUNT(*) as total 
    FROM auth.users
    UNION ALL
    SELECT 
      'profiles' as tabela, COUNT(*) as total 
    FROM public.profiles;
    
    -- 2. Verificar trigger
    SELECT tgname, tgenabled FROM pg_trigger 
    WHERE tgrelid = 'auth.users'::regclass;
    
    -- 3. Verificar função handle_new_user
    SELECT proname, prosrc FROM pg_proc 
    WHERE proname = 'handle_new_user';
    
    -- 4. Ver todos os profiles (como admin)
    SELECT id, first_name, last_name, email, role, created_at 
    FROM public.profiles 
    ORDER BY created_at DESC;
  `);
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
    console.log('⚠️ NOTA: Função debug_get_auth_users com problema de tipo');
    
    // Tentar executar a função mesmo com o erro conhecido
    const { data: authUsers, error: authError } = await supabase
      .rpc('debug_get_auth_users');
    
    if (authError) {
      console.error('❌ Erro esperado ao buscar usuários auth:', authError);
      console.log('🔧 SOLUÇÃO: Execute no SQL Editor do Supabase:');
      console.log(`
        -- Ver usuários auth diretamente
        SELECT id, email, created_at, 
               EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.users.id) as has_profile
        FROM auth.users 
        ORDER BY created_at DESC;
      `);
      
      return { authUsers: [], error: authError };
    }
    
    console.log('🔐 USUÁRIOS AUTH.USERS:');
    console.log(`Total de usuários auth: ${authUsers?.length || 0}`);
    
    if (Array.isArray(authUsers)) {
      authUsers.forEach((user: any, index: number) => {
        console.log(`Auth User ${index + 1}:`, {
          id: user.auth_user_id,
          email: user.auth_email,
          created_at: user.auth_created_at,
          has_profile: user.has_profile
        });
      });
      
      const usersWithoutProfile = authUsers.filter((user: any) => !user.has_profile) || [];
      
      if (usersWithoutProfile.length > 0) {
        console.log('❌ USUÁRIOS SEM PROFILE:');
        usersWithoutProfile.forEach((user: any, index: number) => {
          console.log(`Usuário sem profile ${index + 1}:`, {
            id: user.auth_user_id,
            email: user.auth_email,
            created_at: user.auth_created_at
          });
        });
      } else {
        console.log('✅ Todos os usuários auth têm profiles correspondentes');
      }
    }
    
    return { authUsers: authUsers || [], error: null };
    
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
