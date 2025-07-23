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

    // Verificar se o usuário atual é admin global
    const { data: currentProfile } = await supabaseNormal.from('profiles').select('role').eq('id', currentUser.id).single();

    if (!currentProfile || currentProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores globais podem registrar clínicas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =================
    // OPERAÇÃO TRANSACIONAL: Clínica + Admin
    // Se qualquer parte falhar, tudo é revertido
    // =================

    let createdUserId: string | null = null;
    let createdClinicId: string | null = null;

    try {
      console.log('=== INICIANDO TRANSAÇÃO: CLÍNICA + ADMIN ===');

      // STEP 1: Verificar se email já existe (fail fast)
      console.log('Verificando email existente...');
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', payload.adminData.email)
        .maybeSingle();

      if (existingProfile) {
        return new Response(
          JSON.stringify({ error: 'Já existe um usuário com este email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar também em auth.users
      const { data: authUsers, error: authCheckError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (!authCheckError) {
        const existingAuthUser = authUsers.users?.find(u => u.email === payload.adminData.email);
        if (existingAuthUser) {
          return new Response(
            JSON.stringify({ error: 'Email já existe no sistema de autenticação' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // STEP 2: Criar usuário no auth.users
      console.log('Criando usuário auth...');
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
        console.error('Erro ao criar usuário:', createUserError);
        return new Response(
          JSON.stringify({ 
            error: `Erro ao criar usuário: ${createUserError?.message}`,
            details: createUserError
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      createdUserId = newUser.user.id;
      console.log('✅ Usuário auth criado:', createdUserId);

      // STEP 3: Aguardar profile ser criado pelo trigger
      console.log('Aguardando profile ser criado...');
      let profileCreated = false;
      let attempts = 0;
      const maxAttempts = 15;

      while (!profileCreated && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: profileCheck } = await supabaseAdmin
          .from('profiles')
          .select('id, role, email')
          .eq('id', createdUserId)
          .maybeSingle();

        if (profileCheck) {
          profileCreated = true;
          console.log('✅ Profile criado automaticamente pelo trigger');
        } else {
          attempts++;
          console.log(`Tentativa ${attempts}/${maxAttempts} para profile`);
        }
      }

      if (!profileCreated) {
        console.error('❌ Profile não foi criado pelo trigger');
        // ROLLBACK: Deletar usuário auth
        await supabaseAdmin.auth.admin.deleteUser(createdUserId);
        return new Response(
          JSON.stringify({ error: 'Falha ao criar perfil do usuário' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // STEP 4: Criar clínica
      console.log('Criando clínica...');
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
        console.error('❌ Erro ao criar clínica:', clinicError);
        // ROLLBACK: Deletar usuário auth
        await supabaseAdmin.auth.admin.deleteUser(createdUserId);
        return new Response(
          JSON.stringify({ 
            error: `Erro ao criar clínica: ${clinicError?.message}`,
            details: clinicError
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      createdClinicId = clinicResult.id;
      console.log('✅ Clínica criada:', createdClinicId);

      // STEP 5: Associar usuário à clínica (transação final)
      console.log('Associando admin à clínica...');
      const { error: staffError } = await supabaseAdmin
        .from('clinic_staff')
        .insert({
          user_id: createdUserId,
          clinic_id: createdClinicId,
          is_admin: true,
          role: 'clinic_admin',
          active: true
        });

      if (staffError) {
        console.error('❌ Erro ao associar usuário à clínica:', staffError);
        // ROLLBACK COMPLETO: Deletar usuário E clínica
        await Promise.all([
          supabaseAdmin.auth.admin.deleteUser(createdUserId),
          supabaseAdmin.from('clinics').delete().eq('id', createdClinicId)
        ]);
        
        return new Response(
          JSON.stringify({ 
            error: `Erro ao associar usuário à clínica: ${staffError.message}`,
            details: staffError
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ TRANSAÇÃO COMPLETA COM SUCESSO');

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Clínica e administrador criados com sucesso!',
          data: {
            userId: createdUserId,
            clinicId: createdClinicId,
            adminEmail: payload.adminData.email,
            clinicName: payload.clinicData.name
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (transactionError) {
      console.error('❌ ERRO NA TRANSAÇÃO:', transactionError);
      
      // ROLLBACK COMPLETO EM CASO DE EXCEÇÃO
      const rollbackPromises = [];
      
      if (createdUserId) {
        console.log('🔄 ROLLBACK: Deletando usuário auth');
        rollbackPromises.push(supabaseAdmin.auth.admin.deleteUser(createdUserId));
      }
      
      if (createdClinicId) {
        console.log('🔄 ROLLBACK: Deletando clínica');
        rollbackPromises.push(supabaseAdmin.from('clinics').delete().eq('id', createdClinicId));
      }
      
      await Promise.allSettled(rollbackPromises);
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro na transação - todas as operações foram revertidas',
          details: transactionError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ ERRO GERAL:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});