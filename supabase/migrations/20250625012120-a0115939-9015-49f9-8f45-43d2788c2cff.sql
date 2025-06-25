
-- Corrigir políticas RLS para permitir que admin global veja todos os dados

-- 1. Remover políticas restritivas existentes se houver
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- 2. Criar política para admin global ver todos os profiles
CREATE POLICY "Global admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  OR auth.uid() = id  -- Usuários podem ver seu próprio perfil
);

-- 3. Criar política para admin global gerenciar todos os profiles
CREATE POLICY "Global admin can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  OR auth.uid() = id  -- Usuários podem gerenciar seu próprio perfil
);

-- 4. Política para admin global ver todos os clinic_staff
DROP POLICY IF EXISTS "Users can view clinic staff" ON public.clinic_staff;
CREATE POLICY "Global admin can view all clinic_staff" 
ON public.clinic_staff 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  OR user_id = auth.uid()  -- Usuários podem ver suas próprias relações
);

-- 5. Política para admin global gerenciar clinic_staff
CREATE POLICY "Global admin can manage clinic_staff" 
ON public.clinic_staff 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  OR user_id = auth.uid()
);

-- 6. Política para admin global ver todas as clínicas
DROP POLICY IF EXISTS "Users can view clinics" ON public.clinics;
CREATE POLICY "Global admin can view all clinics" 
ON public.clinics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.clinic_staff cs 
    WHERE cs.clinic_id = id AND cs.user_id = auth.uid() AND cs.active = true
  )
);

-- 7. Política para admin global gerenciar clínicas
CREATE POLICY "Global admin can manage clinics" 
ON public.clinics 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  OR created_by = auth.uid()
);

-- 8. Garantir que RLS está habilitado nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- 9. Corrigir função debug_get_auth_users para retornar tipo correto
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
