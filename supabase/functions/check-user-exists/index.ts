import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('=== VERIFICANDO SE USUÁRIO EXISTE ===');
    console.log('Email:', email);

    // Verificar se existe no profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (profileError) {
      console.error('Erro ao verificar profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (profile) {
      console.log('✅ Usuário já existe no profiles:', profile);
      return new Response(
        JSON.stringify({ 
          exists: true, 
          user: profile,
          message: 'Usuário já existe no sistema' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Usuário não existe, pode ser criado');
    return new Response(
      JSON.stringify({ 
        exists: false, 
        message: 'Usuário pode ser criado' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
});