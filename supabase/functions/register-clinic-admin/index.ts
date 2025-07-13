
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegisterClinicAdminPayload {
  adminData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    crm?: string;
  };
  clinicData: {
    name: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    tradingName?: string;
    cnpj?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: RegisterClinicAdminPayload = await req.json();

    if (!payload.adminData?.email || !payload.adminData?.firstName || !payload.adminData?.lastName) {
      return new Response(
        JSON.stringify({ error: 'Dados do administrador são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.clinicData?.name || !payload.clinicData?.city || !payload.clinicData?.address) {
      return new Response(
        JSON.stringify({ error: 'Dados da clínica são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const { data: { user: currentUser } } = await supabaseNormal.auth.getUser();
    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: currentProfile } = await supabaseNormal.from('profiles').select('role').eq('id', currentUser.id).single();

    if (!currentProfile || currentProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores globais podem registrar clínicas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se email já existe
    const { data: existingProfile } = await supabaseAdmin.from('profiles').select('id, email').eq('email', payload.adminData.email).maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Já existe um usuário com este email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar usuário com dados válidos para evitar campos vazios
    const createUserPayload = {
      email: payload.adminData.email,
      password: 'CardioFlow2024!',
      email_confirm: true,
      user_metadata: {
        first_name: payload.adminData.firstName || 'Nome',
        last_name: payload.adminData.lastName || 'Sobrenome',
        phone: payload.adminData.phone || '',
        crm: payload.adminData.crm || 'N/A',
        role: 'clinic_admin',
        title: '',
        bio: ''
      }
    };
    
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser(createUserPayload);

    if (createUserError || !newUser.user) {
      return new Response(
        JSON.stringify({ 
          error: `Erro ao criar usuário: ${createUserError?.message}`,
          details: createUserError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Aguardar profile ser criado pelo trigger com retry
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
      } else {
        attempts++;
      }
    }

    if (!profileCreated) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Falha ao criar perfil do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar clínica
    const { data: clinicResult, error: clinicError } = await supabaseAdmin.rpc('create_clinic', {
      p_name: payload.clinicData.name,
      p_city: payload.clinicData.city,
      p_address: payload.clinicData.address,
      p_phone: payload.clinicData.phone,
      p_email: payload.clinicData.email,
      p_created_by: currentUser.id,
      p_trading_name: payload.clinicData.tradingName || null,
      p_cnpj: payload.clinicData.cnpj || null
    });

    if (clinicError || !clinicResult?.id) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ 
          error: `Erro ao criar clínica: ${clinicError?.message}`,
          details: clinicError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clinicId = clinicResult.id;

    // Associar usuário à clínica
    const { error: staffError } = await supabaseAdmin
      .from('clinic_staff')
      .insert({
        user_id: newUser.user.id,
        clinic_id: clinicId,
        is_admin: true,
        role: 'clinic_admin',
        active: true
      });

    if (staffError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      await supabaseAdmin.from('clinics').delete().eq('id', clinicId);
      
      return new Response(
        JSON.stringify({ 
          error: `Erro ao associar usuário à clínica: ${staffError.message}`,
          details: staffError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Clínica e administrador criados com sucesso!',
        data: {
          userId: newUser.user.id,
          clinicId: clinicId,
          adminEmail: payload.adminData.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
