
import { supabase } from '@/integrations/supabase/client';

export const checkTriggerStatus = async () => {
  try {
    console.log('=== VERIFICANDO STATUS DO TRIGGER ===');
    
    // Verificar se a função handle_new_user existe
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_name', 'handle_new_user')
      .eq('routine_schema', 'public');
    
    if (funcError) {
      console.error('Erro ao verificar função:', funcError);
      return false;
    }
    
    console.log('Função handle_new_user encontrada:', functions?.length > 0);
    
    // Tentar executar uma verificação direta via RPC se possível
    const { data: triggerCheck, error: triggerError } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            tgname as trigger_name,
            tgenabled as enabled,
            tgtype as trigger_type
          FROM pg_trigger 
          WHERE tgrelid = 'auth.users'::regclass
            AND tgname LIKE '%auth_user%'
        `
      });
    
    if (triggerError) {
      console.error('Erro ao verificar trigger:', triggerError);
      return false;
    }
    
    console.log('Triggers encontrados:', triggerCheck);
    return triggerCheck && triggerCheck.length > 0;
    
  } catch (error) {
    console.error('Erro na verificação de trigger:', error);
    return false;
  }
};

export const testTriggerExecution = async () => {
  try {
    console.log('=== TESTANDO EXECUÇÃO DO TRIGGER ===');
    
    // Simular criação de usuário para testar trigger
    // Nota: Em produção, isso seria feito via Supabase Admin API
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
