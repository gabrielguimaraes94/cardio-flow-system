import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  crm: string;
  role: string;
  title?: string;
  bio?: string;
  clinic_id?: string;
  is_admin?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: CreateUserRequest = await req.json();
    
    console.log('Creating complete user:', { 
      email: requestData.email, 
      role: requestData.role, 
      clinic_id: requestData.clinic_id 
    });

    // Validar dados obrigatórios
    if (!requestData.email || !requestData.first_name || !requestData.last_name || !requestData.role) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios ausentes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se SERVICE_ROLE_KEY está configurada
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY não configurada');
      return new Response(
        JSON.stringify({ 
          error: 'Configuração de servidor incompleta',
          details: 'SUPABASE_SERVICE_ROLE_KEY não configurada. Configure em Edge Functions → Manage secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar se email já existe
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', requestData.email)
      .maybeSingle();

    if (checkError) {
      console.error('Erro ao verificar email existente:', checkError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar dados existentes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Email já existe no sistema' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar usuário completo usando Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: requestData.email,
      password: 'CardioFlow2024!', // Senha padrão mais segura
      user_metadata: {
        first_name: requestData.first_name,
        last_name: requestData.last_name,
        phone: requestData.phone || '',
        crm: requestData.crm,
        role: requestData.role,
        title: requestData.title || '',
        bio: requestData.bio || ''
      },
      email_confirm: true
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

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ error: 'Falha na criação do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário auth criado com sucesso:', authUser.user.id);

    // Se clinic_id foi fornecido, adicionar à clínica
    if (requestData.clinic_id) {
      const { error: staffError } = await supabaseAdmin
        .from('clinic_staff')
        .insert({
          user_id: authUser.user.id,
          clinic_id: requestData.clinic_id,
          is_admin: requestData.is_admin || false,
          role: requestData.role,
          active: true
        });

      if (staffError) {
        console.error('Erro ao adicionar usuário à clínica:', staffError);
        // Não falha a operação, apenas loga o erro
        console.log('Usuário criado mas não adicionado à clínica');
      } else {
        console.log('Usuário adicionado à clínica com sucesso');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authUser.user.id,
        email: authUser.user.email,
        message: 'Usuário criado com sucesso! Senha padrão: CardioFlow2024!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro inesperado na função create-complete-user:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});