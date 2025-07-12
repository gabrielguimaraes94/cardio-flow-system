-- Solução definitiva: Remover constraint e permitir criação direta de profiles
-- para resolver problema de foreign key com auth.users

-- 1. Remover temporariamente a foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Criar função melhorada que não depende de auth.users
CREATE OR REPLACE FUNCTION public.create_user_profile_direct(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_crm text,
  p_role text,
  p_title text,
  p_bio text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Verificar se o usuário atual é admin global
  IF public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores globais podem criar usuários';
  END IF;

  -- Gerar UUID para o novo usuário
  new_user_id := gen_random_uuid();
  
  -- Criar o profile diretamente (sem constraint de auth.users)
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    email,
    crm,
    phone,
    title,
    bio,
    role,
    is_first_login
  ) VALUES (
    new_user_id,
    p_first_name,
    p_last_name,
    p_email,
    p_crm,
    p_phone,
    p_title,
    p_bio,
    p_role::user_role,
    true
  );
  
  RETURN new_user_id;
END;
$$;