
-- Função corrigida para sincronizar profiles faltantes
CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS TABLE(
  synced_user_id uuid,
  synced_email text,
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
    au.email::text,
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
    au.email::text as synced_email,
    'Profile criado automaticamente'::text as action_taken
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );
END;
$$;

-- Políticas RLS mais permissivas para admin global
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Global admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Global admins can manage all clinic_staff" ON public.clinic_staff;

-- Política para admin global ver todos os profiles
CREATE POLICY "Global admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Política para admin global ver todos os clinic_staff
CREATE POLICY "Global admins can view all clinic_staff" 
ON public.clinic_staff 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Habilitar RLS nas tabelas se não estiver habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;

-- Executar a sincronização
SELECT * FROM public.sync_missing_profiles();
