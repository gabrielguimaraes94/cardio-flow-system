
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
    console.log('=== REGISTER CLINIC ADMIN REQUEST ===');
    
    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('Environment Variables Check:');
    console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    
    if (!supabaseUrl) {
      console.error('❌ SUPABASE_URL não configurada');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta: SUPABASE_URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta: SUPABASE_SERVICE_ROLE_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supabaseAnonKey) {
      console.error('❌ SUPABASE_ANON_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta: SUPABASE_ANON_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: RegisterClinicAdminPayload = await req.json();
    console.log('Payload received:', JSON.stringify(payload, null, 2));

    // Validar payload
    if (!payload.adminData?.email || !payload.adminData?.firstName || !payload.adminData?.lastName) {
      console.error('❌ Missing admin data');
      return new Response(
        JSON.stringify({ error: 'Dados do administrador são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.clinicData?.name || !payload.clinicData?.city || !payload.clinicData?.address) {
      console.error('❌ Missing clinic data');
      return new Response(
        JSON.stringify({ error: 'Dados da clínica são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client with service role
    console.log('Creating Supabase admin client...');
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('✅ Supabase admin client created');

    // Verificar se o usuário atual é admin global
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'Autorização necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente normal para verificar permissões
    const supabaseNormal = createClient(
      supabaseUrl,
      supabaseAnonKey,
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
      console.error('❌ No authenticated user');
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Current user:', currentUser.id);

    const { data: currentProfile } = await supabaseNormal
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (!currentProfile || currentProfile.role !== 'admin') {
      console.error('❌ User is not admin:', currentProfile);
      return new Response(
        JSON.stringify({ error: 'Apenas administradores globais podem registrar clínicas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Permission check passed');

    // PASSO 1: Verificar se email já existe
    console.log('=== STEP 1: CHECKING EXISTING EMAIL ===');
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', payload.adminData.email)
      .maybeSingle();

    if (existingProfile) {
      console.error('❌ Email already exists:', payload.adminData.email);
      return new Response(
        JSON.stringify({ error: 'Já existe um usuário com este email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Email is available');

    // PASSO 2: Criar o usuário admin da clínica usando service role
    console.log('=== STEP 2: CREATING ADMIN USER ===');
    
    const createUserPayload = {
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
    };

    console.log('Creating user with payload:', JSON.stringify(createUserPayload, null, 2));
    
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser(createUserPayload);

    if (createUserError) {
      console.error('❌ Error creating user:', createUserError);
      console.error('Error details:', JSON.stringify(createUserError, null, 2));
      return new Response(
        JSON.stringify({ 
          error: `Erro ao criar usuário: ${createUserError.message}`,
          details: createUserError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newUser.user) {
      console.error('❌ No user returned from createUser');
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário: nenhum usuário retornado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User created:', newUser.user.id);

    // PASSO 3: Aguardar profile ser criado pelo trigger
    console.log('=== STEP 3: WAITING FOR PROFILE CREATION ===');
    let profileCreated = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!profileCreated && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profileCheck, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, role, email')
        .eq('id', newUser.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error checking profile:', profileError);
      }

      if (profileCheck) {
        console.log('✅ Profile created:', profileCheck);
        profileCreated = true;
      } else {
        attempts++;
        console.log(`⏳ Waiting for profile... attempt ${attempts}/${maxAttempts}`);
      }
    }

    if (!profileCreated) {
      console.error('❌ Profile creation failed after', maxAttempts, 'attempts');
      // Limpar usuário criado se profile falhou
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Falha ao criar perfil do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PASSO 4: Criar a clínica
    console.log('=== STEP 4: CREATING CLINIC ===');
    
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

    if (clinicError) {
      console.error('❌ Error creating clinic:', clinicError);
      // Limpar usuário criado se clínica falhou
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ 
          error: `Erro ao criar clínica: ${clinicError.message}`,
          details: clinicError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!clinicResult?.id) {
      console.error('❌ No clinic ID returned');
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar clínica: ID não retornado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clinicId = clinicResult.id;
    console.log('✅ Clinic created:', clinicId);

    // PASSO 5: Associar usuário à clínica
    console.log('=== STEP 5: LINKING USER TO CLINIC ===');
    
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
        JSON.stringify({ 
          error: `Erro ao associar usuário à clínica: ${staffError.message}`,
          details: staffError
        }),
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
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
