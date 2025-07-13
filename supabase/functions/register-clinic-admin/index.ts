
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: RegisterClinicAdminPayload = await req.json();
    
    console.log('=== REGISTER CLINIC ADMIN REQUEST ===');
    console.log('Payload received:', JSON.stringify(payload, null, 2));

    // Validar payload
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

    // Create Supabase admin client with service role
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

    // Verificar se o usuário atual é admin global
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autorização necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente normal para verificar permissões
    const supabaseNormal = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    const { data: { user: currentUser } } = await supabaseNormal.auth.getUser();
    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: currentProfile } = await supabaseNormal
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (!currentProfile || currentProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores globais podem registrar clínicas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Permission check passed');

    // PASSO 1: Criar o usuário admin da clínica usando service role
    console.log('=== STEP 1: CREATING ADMIN USER ===');
    
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.adminData.email,
      password: 'CardioFlow2024!', // Senha padrão
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        first_name: payload.adminData.firstName,
        last_name: payload.adminData.lastName,
        phone: payload.adminData.phone || '',
        crm: payload.adminData.crm || '',
        role: 'clinic_admin',
        title: '',
        bio: ''
      }
    });

    if (createUserError || !newUser.user) {
      console.error('❌ Error creating user:', createUserError);
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${createUserError?.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User created:', newUser.user.id);

    // PASSO 2: Aguardar profile ser criado pelo trigger
    console.log('=== STEP 2: WAITING FOR PROFILE CREATION ===');
    let profileCreated = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!profileCreated && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profileCheck } = await supabaseAdmin
        .from('profiles')
        .select('id, role, email')
        .eq('id', newUser.user.id)
        .maybeSingle();

      if (profileCheck) {
        console.log('✅ Profile created:', profileCheck);
        profileCreated = true;
      } else {
        attempts++;
        console.log(`⏳ Waiting for profile... attempt ${attempts}/${maxAttempts}`);
      }
    }

    if (!profileCreated) {
      // Limpar usuário criado se profile falhou
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Falha ao criar perfil do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PASSO 3: Criar a clínica
    console.log('=== STEP 3: CREATING CLINIC ===');
    
    const { data: clinicResult, error: clinicError } = await supabaseAdmin.rpc('create_clinic', {
      p_name: payload.clinicData.name,
      p_city: payload.clinicData.city,
      p_address: payload.clinicData.address,
      p_phone: payload.clinicData.phone,
      p_email: payload.clinicData.email,
      p_created_by: currentUser.id,
      p_trading_name: payload.clinicData.tradingName,
      p_cnpj: payload.clinicData.cnpj
    });

    if (clinicError || !clinicResult?.id) {
      console.error('❌ Error creating clinic:', clinicError);
      // Limpar usuário criado se clínica falhou
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: `Erro ao criar clínica: ${clinicError?.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clinicId = clinicResult.id;
    console.log('✅ Clinic created:', clinicId);

    // PASSO 4: Associar usuário à clínica
    console.log('=== STEP 4: LINKING USER TO CLINIC ===');
    
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
      console.error('❌ Error linking user to clinic:', staffError);
      // Cleanup em caso de erro
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      await supabaseAdmin.from('clinics').delete().eq('id', clinicId);
      
      return new Response(
        JSON.stringify({ error: `Erro ao associar usuário à clínica: ${staffError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User linked to clinic successfully');

    // Sucesso!
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
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
