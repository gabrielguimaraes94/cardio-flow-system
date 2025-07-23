import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateStaffRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  crm: string;
  role: string;
  title?: string;
  bio?: string;
  clinic_id: string;
  is_admin?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: CreateStaffRequest = await req.json();
    
    console.log('Creating clinic staff:', { 
      email: requestData.email, 
      role: requestData.role, 
      clinic_id: requestData.clinic_id 
    });

    // Validar dados obrigatórios
    if (!requestData.email || !requestData.first_name || !requestData.last_name || !requestData.role || !requestData.clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios ausentes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar clients Supabase
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autorização necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseNormal = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verificar usuário atual
    const { data: { user: currentUser } } = await supabaseNormal.auth.getUser();
    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o usuário atual é admin global OU admin da clínica
    const { data: currentProfile } = await supabaseNormal.from('profiles').select('role').eq('id', currentUser.id).single();
    
    let canCreateStaff = false;
    
    if (currentProfile?.role === 'admin') {
      canCreateStaff = true;
      console.log('Global admin creating staff');
    } else {
      // Verificar se é admin da clínica específica
      const { data: staffRecord } = await supabaseNormal
        .from('clinic_staff')
        .select('is_admin, clinic_id')
        .eq('user_id', currentUser.id)
        .eq('clinic_id', requestData.clinic_id)
        .eq('active', true)
        .eq('is_admin', true)
        .single();
      
      if (staffRecord) {
        canCreateStaff = true;
        console.log('Clinic admin creating staff for their clinic');
      }
    }

    if (!canCreateStaff) {
      return new Response(
        JSON.stringify({ error: 'Sem permissão para criar funcionários nesta clínica' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se email já existe
    const { data: existingProfile } = await supabaseAdmin.from('profiles').select('id, email').eq('email', requestData.email).maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Já existe um usuário com este email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se existe no auth.users também
    const { data: authUsers, error: authCheckError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (!authCheckError) {
      const existingAuthUser = authUsers.users?.find(u => u.email === requestData.email);
      if (existingAuthUser) {
        return new Response(
          JSON.stringify({ error: 'Email já existe no sistema de autenticação' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Criar usuário no auth.users
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: requestData.email,
      password: 'CardioFlow2024!',
      email_confirm: true,
      user_metadata: {
        first_name: requestData.first_name,
        last_name: requestData.last_name,
        phone: requestData.phone || '',
        crm: requestData.crm,
        role: requestData.role,
        title: requestData.title || '',
        bio: requestData.bio || ''
      }
    });

    if (createUserError || !newUser.user) {
      return new Response(
        JSON.stringify({ 
          error: `Erro ao criar usuário: ${createUserError?.message}`,
          details: createUserError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auth user created:', newUser.user.id);

    // Aguardar profile ser criado pelo trigger
    let profileCreated = false;
    let attempts = 0;
    const maxAttempts = 15;

    while (!profileCreated && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profileCheck } = await supabaseAdmin
        .from('profiles')
        .select('id, role, email')
        .eq('id', newUser.user.id)
        .maybeSingle();

      if (profileCheck) {
        profileCreated = true;
        console.log('Profile created successfully');
      } else {
        attempts++;
        console.log(`Profile creation attempt ${attempts}/${maxAttempts}`);
      }
    }

    if (!profileCreated) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Falha ao criar perfil do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Adicionar usuário à clínica como staff
    const { error: staffError } = await supabaseAdmin
      .from('clinic_staff')
      .insert({
        user_id: newUser.user.id,
        clinic_id: requestData.clinic_id,
        is_admin: requestData.is_admin || false,
        role: requestData.role,
        active: true
      });

    if (staffError) {
      console.error('Erro ao adicionar à clínica:', staffError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: `Erro ao associar usuário à clínica: ${staffError.message}`,
          details: staffError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Staff member added to clinic successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Funcionário criado com sucesso!',
        data: {
          userId: newUser.user.id,
          email: requestData.email,
          clinicId: requestData.clinic_id
        }
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