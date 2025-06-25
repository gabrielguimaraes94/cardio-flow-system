
-- Função para debug dos usuários do auth vs profiles
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
    au.email as auth_email,
    au.created_at as auth_created_at,
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = au.id) as has_profile
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;
