
import { supabase } from '@/integrations/supabase/client';

export const checkTriggerStatus = async () => {
  try {
    console.log('=== VERIFICANDO STATUS DO SISTEMA ===');
    
    // Não conseguimos verificar triggers diretamente via PostgREST
    // Mas podemos testar se as funções necessárias existem
    
    console.log('🔧 TESTANDO FUNÇÕES DO SISTEMA...');
    
    // Testar função debug_get_auth_users
    try {
      const { data: authUsers, error: authError } = await supabase
        .rpc('debug_get_auth_users');
      
      if (authError) {
        console.log('❌ Função debug_get_auth_users com erro:', authError.message);
        return false;
      } else {
        console.log('✅ Função debug_get_auth_users funcionando!');
        console.log(`Encontrou ${authUsers?.length || 0} usuários auth`);
      }
    } catch (error) {
      console.log('❌ Erro ao testar debug_get_auth_users:', error);
      return false;
    }
    
    // Testar função sync_missing_profiles
    try {
      const { data: syncResult, error: syncError } = await supabase
        .rpc('sync_missing_profiles');
      
      if (syncError) {
        console.log('❌ Função sync_missing_profiles com erro:', syncError.message);
      } else {
        console.log('✅ Função sync_missing_profiles funcionando!');
        console.log(`Resultado da sincronização: ${syncResult?.length || 0} profiles`);
      }
    } catch (error) {
      console.log('❌ Erro ao testar sync_missing_profiles:', error);
    }
    
    // Testar acesso aos dados básicos
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .limit(1);
      
      if (profilesError) {
        console.log('❌ Erro ao acessar profiles:', profilesError.message);
        return false;
      } else {
        console.log('✅ Acesso aos profiles funcionando!');
      }
    } catch (error) {
      console.log('❌ Erro ao testar acesso aos profiles:', error);
      return false;
    }
    
    console.log('=== VERIFICAÇÃO MANUAL NECESSÁRIA ===');
    console.log('Para verificar triggers e funções avançadas, execute no SQL Editor:');
    console.log(`
      -- Verificar se a função handle_new_user existe
      SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
      
      -- Verificar triggers na tabela auth.users
      SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
      
      -- Comparar usuários auth vs profiles
      SELECT 
        (SELECT COUNT(*) FROM auth.users) as auth_users_count,
        (SELECT COUNT(*) FROM public.profiles) as profiles_count;
    `);
    
    return true;
    
  } catch (error) {
    console.error('Erro na verificação do sistema:', error);
    return false;
  }
};

export const testTriggerExecution = async () => {
  try {
    console.log('=== TESTANDO EXECUÇÃO DO SISTEMA ===');
    
    console.log('📝 INSTRUÇÕES PARA TESTE MANUAL:');
    console.log(`
      1. Acesse o SQL Editor do Supabase
      2. Execute estas queries para verificar o sistema:
      
      -- Verificar função handle_new_user
      SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
      
      -- Verificar triggers
      SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
      
      -- Testar criação manual de profile
      SELECT * FROM public.handle_new_user();
      
      -- Verificar consistência de dados
      SELECT 
        au.id,
        au.email,
        p.id IS NOT NULL as has_profile
      FROM auth.users au
      LEFT JOIN public.profiles p ON p.id = au.id
      ORDER BY au.created_at DESC;
    `);
    
    return true;
    
  } catch (error) {
    console.error('Erro no teste do sistema:', error);
    return false;
  }
};
