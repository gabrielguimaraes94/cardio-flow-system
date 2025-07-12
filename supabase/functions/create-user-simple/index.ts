
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
    
    console.log('=== CREATE USER SIMPLE START ===');
    console.log('Request data received:', JSON.stringify(requestData, null, 2));

    // Validar dados obrigatórios
    if (!requestData.email || !requestData.first_name || !requestData.last_name) {
      console.error('Dados obrigatórios faltando:', {
        email: !!requestData.email,
        first_name: !!requestData.first_name,
        last_name: !!requestData.last_name
      });
      return new Response(
        JSON.stringify({ 
          error: 'Dados obrigatórios faltando',
          details: 'Email, nome e sobrenome são obrigatórios'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar role
    const validRoles = ['admin', 'clinic_admin', 'doctor', 'nurse', 'receptionist', 'staff'];
    if (!validRoles.includes(requestData.role)) {
      console.error('Role inválido:', requestData.role);
      return new Response(
        JSON.stringify({ 
          error: 'Role inválido',
          details: `Role deve ser um dos: ${validRoles.join(', ')}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Validação passou. Criando usuário...');

    // Criar um cliente Supabase separado para não afetar a sessão atual
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Cliente Supabase criado. Fazendo signup...');

    // Fazer signup simples - o trigger handle_new_user vai criar o profile automaticamente
    const { data, error } = await supabaseClient.auth.signUp({
      email: requestData.email,
      password: 'CardioFlow2024!', // Senha padrão
      options: {
        data: {
          first_name: requestData.first_name,
          last_name: requestData.last_name,
          phone: requestData.phone || '',
          crm: requestData.crm || '',
          role: requestData.role,
          title: requestData.title || '',
          bio: requestData.bio || ''
        }
      }
    });

    if (error) {
      console.error('Erro no signup:', JSON.stringify(error, null, 2));
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao criar usuário',
          details: error.message,
          code: error.status
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.user) {
      console.error('Signup retornou sem user data:', JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ error: 'Falha na criação do usuário - sem dados do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário criado com sucesso:', {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at
    });

    // Se clinic_id foi fornecido, adicionar à clínica
    if (requestData.clinic_id) {
      console.log('Adicionando usuário à clínica:', requestData.clinic_id);
      
      // Usar cliente admin para operações que precisam de privilégios elevados
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');
      
      if (!serviceRoleKey) {
        console.error('SERVICE_ROLE_KEY não encontrado nas env vars');
        console.log('Env vars disponíveis:', Object.keys(Deno.env.toObject()).filter(k => k.includes('SERVICE') || k.includes('SUPABASE')));
      } else {
        console.log('SERVICE_ROLE_KEY encontrado, criando cliente admin...');
        
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          serviceRoleKey
        );

        // Tentar usar a função add_clinic_staff primeiro
        console.log('Tentando RPC add_clinic_staff...');
        const { data: staffResult, error: staffError } = await supabaseAdmin
          .rpc('add_clinic_staff', {
            p_user_id: data.user.id,
            p_clinic_id: requestData.clinic_id,
            p_is_admin: requestData.is_admin || false,
            p_role: requestData.role
          });

        if (staffError) {
          console.error('Erro no RPC add_clinic_staff:', JSON.stringify(staffError, null, 2));
          
          // Fallback: inserção direta na tabela clinic_staff
          console.log('Tentando inserção direta na tabela clinic_staff...');
          const { data: insertResult, error: directInsertError } = await supabaseAdmin
            .from('clinic_staff')
            .insert({
              user_id: data.user.id,
              clinic_id: requestData.clinic_id,
              is_admin: requestData.is_admin || false,
              role: requestData.role,
              active: true
            })
            .select();

          if (directInsertError) {
            console.error('Erro na inserção direta:', JSON.stringify(directInsertError, null, 2));
            // Não falhar o processo todo por causa disso
          } else {
            console.log('Usuário adicionado à clínica via inserção direta:', insertResult);
          }
        } else {
          console.log('Usuário adicionado à clínica via RPC com sucesso:', staffResult);
        }
      }
    }

    console.log('=== CREATE USER SIMPLE SUCCESS ===');
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
    console.error('=== CREATE USER SIMPLE ERROR ===');
    console.error('Erro inesperado:', error);
    console.error('Stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
