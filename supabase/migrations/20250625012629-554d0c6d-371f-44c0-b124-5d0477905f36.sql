
-- Corrigir recursão infinita nas políticas RLS usando função security definer

-- 1. Criar função security definer para verificar role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Remover políticas problemáticas
DROP POLICY IF EXISTS "Global admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Global admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Global admin can view all clinic_staff" ON public.clinic_staff;
DROP POLICY IF EXISTS "Global admin can manage clinic_staff" ON public.clinic_staff;
DROP POLICY IF EXISTS "Global admin can view all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Global admin can manage clinics" ON public.clinics;

-- 3. Criar políticas corretas usando a função security definer
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin'
  OR auth.uid() = id
);

CREATE POLICY "Admin can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  public.get_current_user_role() = 'admin'
  OR auth.uid() = id
);

CREATE POLICY "Admin can view all clinic_staff" 
ON public.clinic_staff 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin'
  OR user_id = auth.uid()
);

CREATE POLICY "Admin can manage all clinic_staff" 
ON public.clinic_staff 
FOR ALL 
USING (
  public.get_current_user_role() = 'admin'
  OR user_id = auth.uid()
);

CREATE POLICY "Admin can view all clinics" 
ON public.clinics 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin'
  OR EXISTS (
    SELECT 1 FROM public.clinic_staff cs 
    WHERE cs.clinic_id = id AND cs.user_id = auth.uid() AND cs.active = true
  )
);

CREATE POLICY "Admin can manage all clinics" 
ON public.clinics 
FOR ALL 
USING (
  public.get_current_user_role() = 'admin'
  OR created_by = auth.uid()
);
