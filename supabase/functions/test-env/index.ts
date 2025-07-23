import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');
    
    console.log('=== DEBUG ENVIRONMENT ===');
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SERVICE_ROLE_KEY exists:', !!serviceRoleKey);
    console.log('SUPABASE_URL value:', supabaseUrl);
    
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing environment variables',
          hasUrl: !!supabaseUrl,
          hasKey: !!serviceRoleKey
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test Admin Client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // Test simple query first
    const { data: testData, error: testError } = await supabaseAdmin
      .from('profiles')
      .select('count(*)')
      .limit(1);
    
    console.log('Test query result:', testData, testError);
    
    if (testError) {
      return new Response(
        JSON.stringify({ 
          error: 'Database connection failed',
          details: testError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test Auth Admin API
    try {
      const { data: authTest, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      console.log('Auth API test:', !!authTest, authError);
      
      if (authError) {
        return new Response(
          JSON.stringify({ 
            error: 'Auth API access failed',
            details: authError,
            code: authError.code,
            message: authError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'All tests passed',
          dbConnection: 'OK',
          authApi: 'OK',
          userCount: authTest?.users?.length || 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (authException) {
      console.error('Auth API exception:', authException);
      return new Response(
        JSON.stringify({ 
          error: 'Auth API exception',
          details: authException.message,
          stack: authException.stack
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('General error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});