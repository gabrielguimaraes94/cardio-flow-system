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
    
    console.log('Creating user (simple approach):', { 
      email: requestData.email, 
      role: requestData.role, 
      clinic_id: requestData.clinic_id 
    });

    // Criar um cliente Supabase separado para não afetar a sessão atual
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fazer signup sem afetar a sessão principal
    const { data, error } = await supabaseClient.auth.signUp({
      email: requestData.email,
      password: 'CardioFlow2024!', // Senha padrão
      options: {
        data: {
          first_name: requestData.first_name,
          last_name: requestData.last_name,
          phone: requestData.phone || '',
          crm: requestData.crm,
          role: requestData.role,
          title: requestData.title || '',
          bio: requestData.bio || ''
        }
      }
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao criar usuário',
          details: error.message
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({ error: 'Falha na criação do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário criado:', data.user.id);

    // Se clinic_id foi fornecido, adicionar à clínica usando service role
    if (requestData.clinic_id) {
      const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');
      if (serviceRoleKey) {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          serviceRoleKey
        );

        const { error: staffError } = await supabaseAdmin
          .from('clinic_staff')
          .insert({
            user_id: data.user.id,
            clinic_id: requestData.clinic_id,
            is_admin: requestData.is_admin || false,
            role: requestData.role,
            active: true
          });

        if (staffError) {
          console.error('Erro ao adicionar usuário à clínica:', staffError);
        } else {
          console.log('Usuário adicionado à clínica com sucesso');
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: data.user.id,
        email: data.user.email,
        message: 'Usuário criado com sucesso! Senha padrão: CardioFlow2024!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});