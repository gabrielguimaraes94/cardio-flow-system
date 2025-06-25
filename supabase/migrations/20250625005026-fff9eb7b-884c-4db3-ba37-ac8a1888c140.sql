
-- Função corrigida para sincronizar profiles faltantes
CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS TABLE(
  synced_user_id uuid,
  synced_email character varying(255),
  action_taken text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir profiles para usuários que existem em auth.users mas não em profiles
  INSERT INTO public.profiles (id, first_name, last_name, email, crm, role)
  SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
    au.email,
    COALESCE(au.raw_user_meta_data->>'crm', '') as crm,
    'doctor'::user_role as role
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );

  -- Retornar informações sobre os usuários sincronizados
  RETURN QUERY
  SELECT 
    au.id as synced_user_id,
    au.email as synced_email,
    'Profile criado automaticamente'::text as action_taken
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );
END;
$$;

-- Executar a sincronização
SELECT * FROM public.sync_missing_profiles();
