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

    console.log('=== CRIANDO PROFILE DO ADMIN ===');

    // STEP 1: Verificar se o profile já existe
    console.log('Verificando se profile já existe...');
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', 'b4542ae6-91f6-43b2-856b-3093ddb9df81')
      .maybeSingle();

    if (existingProfile) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Profile do admin já existe!',
        profileId: existingProfile.id
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // STEP 2: Criar o profile
    console.log('Criando profile do admin...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: 'b4542ae6-91f6-43b2-856b-3093ddb9df81',
        first_name: 'Admin',
        last_name: 'Sistema',
        email: 'admin@cardioflow.com',
        crm: 'ADMIN001',
        phone: '11999999999',
        role: 'admin'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Erro ao criar profile:', profileError);
      return new Response(JSON.stringify({
        error: `Erro ao criar profile: ${profileError.message}`,
        details: profileError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('✅ Profile do admin criado:', profileData?.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Profile do admin criado com sucesso!',
      data: {
        profileId: profileData?.id,
        adminEmail: 'admin@cardioflow.com',
        note: 'Agora você pode fazer login e criar clínicas!'
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