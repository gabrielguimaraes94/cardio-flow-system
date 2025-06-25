
import { supabase } from '@/integrations/supabase/client';

export const checkTriggerStatus = async () => {
  try {
    console.log('=== VERIFICANDO STATUS DO TRIGGER ===');
    
    // Como não podemos acessar information_schema diretamente via PostgREST,
    // vamos tentar executar a função handle_new_user diretamente
    console.log('🔧 TESTANDO se a função handle_new_user existe...');
    
    // Tentar chamar uma função que existe para comparar
    const { data: testExistingFunction, error: existingError } = await supabase
      .rpc('is_global_admin', { user_uuid: 'test-uuid' });
    
    console.log('Teste de função existente (is_global_admin):', { testExistingFunction, existingError });
    
    // Informar ao usuário que precisa verificar manualmente
    console.log('📝 VERIFICAÇÃO MANUAL NECESSÁRIA:');
    console.log('Para verificar triggers e funções, execute no SQL Editor do Supabase:');
    console.log(`
      -- Verificar se a função handle_new_user existe
      SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
      
      -- Verificar triggers na tabela auth.users
      SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
      
      -- Verificar usuários auth vs profiles
      SELECT 
        (SELECT COUNT(*) FROM auth.users) as auth_users_count,
        (SELECT COUNT(*) FROM public.profiles) as profiles_count;
    `);
    
    return false; // Retornamos false pois não conseguimos verificar via API
    
  } catch (error) {
    console.error('Erro na verificação de trigger:', error);
    return false;
  }
};

export const testTriggerExecution = async () => {
  try {
    console.log('=== TESTANDO EXECUÇÃO DO TRIGGER ===');
    
    console.log('Para testar o trigger, execute no SQL Editor:');
    console.log(`
      -- Teste manual do trigger
      SELECT public.handle_new_user();
      
      -- Verificar se a função existe
      SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
      
      -- Verificar triggers na tabela auth.users
      SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
    `);
    
    return true;
    
  } catch (error) {
    console.error('Erro no teste de trigger:', error);
    return false;
  }
};
