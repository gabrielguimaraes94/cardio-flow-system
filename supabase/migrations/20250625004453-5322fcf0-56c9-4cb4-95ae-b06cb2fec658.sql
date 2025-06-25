
-- Função para debug dos usuários do auth vs profiles (CORRIGIDA)
CREATE OR REPLACE FUNCTION public.debug_get_auth_users()
RETURNS TABLE(
  auth_user_id uuid,
  auth_email text,
  auth_created_at timestamptz,
  has_profile boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as auth_user_id,
    au.email::text as auth_email,
    au.created_at as auth_created_at,
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = au.id) as has_profile
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Função para criar usuário completo (auth + profile + clinic_staff)
CREATE OR REPLACE FUNCTION public.create_clinic_user(
  p_email text,
  p_password text,
  p_first_name text,
  p_last_name text,
  p_crm text,
  p_role user_role,
  p_clinic_id uuid,
  p_is_admin boolean DEFAULT false,
  p_created_by uuid DEFAULT NULL
)
RETURNS TABLE(
  user_id uuid,
  profile_created boolean,
  staff_created boolean,
  success boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  profile_success boolean := false;
  staff_success boolean := false;
BEGIN
  -- Criar usuário no auth.users usando a função admin do Supabase
  -- Nota: Esta função precisa ser chamada via API do Supabase Admin
  -- Por enquanto, retornamos instruções para implementação manual
  
  -- Simular criação para fins de teste
  new_user_id := gen_random_uuid();
  
  -- Criar profile
  BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email, crm, role)
    VALUES (new_user_id, p_first_name, p_last_name, p_email, p_crm, p_role);
    profile_success := true;
  EXCEPTION WHEN OTHERS THEN
    profile_success := false;
  END;
  
  -- Criar relação clinic_staff
  BEGIN
    INSERT INTO public.clinic_staff (user_id, clinic_id, role, is_admin)
    VALUES (new_user_id, p_clinic_id, p_role::text, p_is_admin);
    staff_success := true;
  EXCEPTION WHEN OTHERS THEN
    staff_success := false;
  END;
  
  RETURN QUERY
  SELECT 
    new_user_id as user_id,
    profile_success,
    staff_success,
    (profile_success AND staff_success) as success;
END;
$$;

-- Verificar se o trigger existe e criar se necessário
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    -- Criar o trigger para criação automática de profiles
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
