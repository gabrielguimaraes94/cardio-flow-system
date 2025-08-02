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

    console.log('=== CRIANDO USUÁRIO ADMIN ===');

    // STEP 1: Verificar se o usuário já existe
    console.log('Verificando se usuário admin já existe...');
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ Erro ao verificar usuários:', checkError);
      return new Response(JSON.stringify({
        error: `Erro ao verificar usuários: ${checkError.message}`,
        details: checkError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const adminExists = existingUser.users.find(user => user.email === 'admin@cardioflow.com');
    
    if (adminExists) {
      console.log('❌ Usuário admin já existe');
      return new Response(JSON.stringify({
        error: 'Usuário admin já existe no sistema',
        user_id: adminExists.id
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // STEP 2: Criar o usuário admin
    console.log('Criando usuário admin...');
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@cardioflow.com',
      password: '12345678',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'Sistema',
        phone: '11999999999',
        crm: 'ADMIN001',
        role: 'admin',
        title: 'Administrador do Sistema',
        bio: 'Usuário administrador do CardioFlow'
      }
    });

    if (adminError) {
      console.error('❌ Erro ao criar usuário admin:', adminError);
      return new Response(JSON.stringify({
        error: `Erro ao criar usuário admin: ${adminError.message}`,
        details: adminError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('✅ Usuário admin criado:', adminUser.user?.id);

    // STEP 3: Aguardar um pouco para o trigger criar o profile
    await new Promise(resolve => setTimeout(resolve, 2000));

    // STEP 4: Verificar se o profile foi criado
    console.log('Verificando se profile foi criado...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', adminUser.user!.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile não foi criado:', profileError);
      return new Response(JSON.stringify({
        error: 'Usuário criado mas profile não foi encontrado',
        user_id: adminUser.user!.id,
        details: profileError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('✅ Profile criado com sucesso:', profile);

    return new Response(JSON.stringify({
      success: true,
      message: 'Usuário admin criado com sucesso!',
      data: {
        user_id: adminUser.user!.id,
        email: 'admin@cardioflow.com',
        password: '12345678',
        profile: profile,
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