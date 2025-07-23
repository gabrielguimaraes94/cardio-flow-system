import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateAdminRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  crm: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== INÍCIO - CRIAR ADMIN DE CLÍNICA ===');
    
    const { email, firstName, lastName, phone, crm }: CreateAdminRequest = await req.json();
    
    console.log('Dados recebidos:', { email, firstName, lastName, phone, crm });

    // Validar dados obrigatórios
    if (!email || !firstName || !lastName || !crm) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: email, firstName, lastName, crm' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Cliente Supabase Admin criado');

    // Verificar se o email já existe
    console.log('Verificando se email já existe...');
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar email existente:', checkError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar email existente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingUser) {
      console.log('Email já existe');
      return new Response(
        JSON.stringify({ error: 'Este email já está cadastrado no sistema' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Email disponível, criando usuário...');

    // Criar usuário com senha padrão
    const defaultPassword = 'CardioFlow2024!';
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || '',
        crm: crm,
        role: 'clinic_admin',
        title: '',
        bio: ''
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário auth:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao criar usuário', 
          details: authError.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário criado com sucesso:', authUser.user?.id);

    // Aguardar um pouco para garantir que o trigger criou o profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar se o profile foi criado
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.user!.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile não foi criado automaticamente:', profileError);
      return new Response(
        JSON.stringify({ 
          error: 'Usuário criado mas profile não foi encontrado', 
          user_id: authUser.user!.id 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile encontrado:', profile);

    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: authUser.user!.id,
        email: email,
        message: 'Administrador da clínica criado com sucesso!',
        default_password: defaultPassword,
        profile: profile
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});