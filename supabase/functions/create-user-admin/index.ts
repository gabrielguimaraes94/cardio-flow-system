import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      phone, 
      crm, 
      role, 
      title, 
      bio,
      clinic_id,
      is_admin = false
    } = await req.json();

    console.log('Creating user with admin function:', { email, role, clinic_id });

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

    // Create user in auth.users using admin client
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name,
        last_name,
        phone,
        crm,
        role,
        title,
        bio
      },
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auth user created successfully:', authUser.user?.id);

    // Add user to clinic staff if clinic_id is provided
    if (clinic_id && authUser.user) {
      const { error: staffError } = await supabaseAdmin.rpc('add_clinic_staff', {
        p_user_id: authUser.user.id,
        p_clinic_id: clinic_id,
        p_is_admin: is_admin,
        p_role: role
      });

      if (staffError) {
        console.error('Error adding user to clinic staff:', staffError);
        // Don't fail the entire operation, just log the error
      } else {
        console.log('User added to clinic staff successfully');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authUser.user?.id,
        message: 'Usuário criado com sucesso!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-user-admin function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});