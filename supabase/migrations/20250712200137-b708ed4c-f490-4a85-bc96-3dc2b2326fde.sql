-- SOLUÇÃO DEFINITIVA: Restaurar integridade e criar sistema completo

-- 1. Recriar a foreign key constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Criar função que funciona com Supabase Auth Admin API via service role
CREATE OR REPLACE FUNCTION public.create_complete_user(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_crm text,
  p_role text,
  p_title text,
  p_bio text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  result jsonb;
BEGIN
  -- Verificar se o usuário atual é admin global
  IF public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores globais podem criar usuários';
  END IF;

  -- Retornar dados para que o frontend use a Auth Admin API
  result := jsonb_build_object(
    'email', p_email,
    'user_metadata', jsonb_build_object(
      'first_name', p_first_name,
      'last_name', p_last_name,
      'phone', p_phone,
      'crm', p_crm,
      'role', p_role,
      'title', p_title,
      'bio', p_bio
    ),
    'require_service_role', true
  );
  
  RETURN result;
END;
$$;

-- 3. Função auxiliar para verificar se usuário já existe por email
CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE email = p_email
  );
END;
$$;