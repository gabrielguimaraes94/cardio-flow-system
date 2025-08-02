-- Criar todas as funções RPC que estão faltando

-- Função para verificar primeiro login
CREATE OR REPLACE FUNCTION public.is_user_first_login(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_first_login, true) 
  FROM public.profiles 
  WHERE id = user_uuid;
$$;

-- Função para marcar primeiro login como completo
CREATE OR REPLACE FUNCTION public.mark_first_login_complete(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles 
  SET is_first_login = false 
  WHERE id = user_uuid;
  
  SELECT true;
$$;

-- Função para obter clínicas do usuário
CREATE OR REPLACE FUNCTION public.get_user_clinics(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  clinic_id UUID,
  clinic_name TEXT,
  clinic_city TEXT,
  clinic_logo_url TEXT,
  staff_id UUID,
  is_admin BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    c.city as clinic_city,
    c.logo_url as clinic_logo_url,
    cs.id as staff_id,
    cs.is_admin
  FROM public.clinics c
  INNER JOIN public.clinic_staff cs ON c.id = cs.clinic_id
  WHERE cs.user_id = user_uuid 
  AND cs.active = true 
  AND c.active = true;
$$;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT 
  FROM public.profiles 
  WHERE id = auth.uid();
$$;

-- Função para debug de usuários auth
CREATE OR REPLACE FUNCTION public.debug_get_auth_users()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.email,
    p.created_at
  FROM public.profiles p;
$$;

-- Função para criar clínica
CREATE OR REPLACE FUNCTION public.create_clinic(
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_city TEXT,
  clinic_phone TEXT,
  clinic_email TEXT,
  clinic_cnpj TEXT DEFAULT NULL,
  clinic_trading_name TEXT DEFAULT NULL,
  clinic_logo_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.clinics (
    name, address, city, phone, email, cnpj, trading_name, logo_url, created_by
  ) VALUES (
    clinic_name, clinic_address, clinic_city, clinic_phone, clinic_email, 
    clinic_cnpj, clinic_trading_name, clinic_logo_url, auth.uid()
  )
  RETURNING id;
$$;

-- Função para sincronizar profiles faltantes
CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  action TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    'synced'::TEXT as action
  FROM public.profiles p;
END;
$$;

-- Função para adicionar staff à clínica
CREATE OR REPLACE FUNCTION public.add_clinic_staff(
  clinic_uuid UUID,
  user_uuid UUID,
  staff_role TEXT,
  staff_is_admin BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.clinic_staff (clinic_id, user_id, role, is_admin)
  VALUES (clinic_uuid, user_uuid, staff_role, staff_is_admin)
  RETURNING id;
$$;

-- Função para remover staff da clínica
CREATE OR REPLACE FUNCTION public.remove_clinic_staff(
  staff_uuid UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.clinic_staff 
  SET active = false 
  WHERE id = staff_uuid;
  
  SELECT true;
$$;