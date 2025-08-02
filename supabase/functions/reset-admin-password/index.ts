import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({
        error: 'Variáveis de ambiente não configuradas'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log('=== RESETANDO SENHA DO ADMIN ===');

    // STEP 1: Resetar senha do admin
    console.log('Resetando senha do admin...');
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      'b4542ae6-91f6-43b2-856b-3093ddb9df81',
      {
        password: '12345678'
      }
    );

    if (updateError) {
      console.error('❌ Erro ao resetar senha:', updateError);
      return new Response(JSON.stringify({
        error: `Erro ao resetar senha: ${updateError.message}`,
        details: updateError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('✅ Senha do admin resetada com sucesso!');

    return new Response(JSON.stringify({
      success: true,
      message: 'Senha do admin resetada com sucesso!',
      data: {
        adminEmail: 'admin@cardioflow.com',
        newPassword: '12345678',
        note: 'Agora você pode fazer login com admin@cardioflow.com / 12345678'
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ ERRO GERAL:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}); 