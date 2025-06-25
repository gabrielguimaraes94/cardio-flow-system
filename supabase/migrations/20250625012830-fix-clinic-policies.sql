
-- Corrigir políticas para clínicas e clinic_staff manterem funcionalidade anterior

-- 1. Remover políticas atuais que podem estar causando problemas
DROP POLICY IF EXISTS "Admin can view all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admin can manage all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admin can view all clinic_staff" ON public.clinic_staff;
DROP POLICY IF EXISTS "Admin can manage all clinic_staff" ON public.clinic_staff;

-- 2. Recriar políticas para clínicas com lógica mais simples
CREATE POLICY "Users can view accessible clinics" 
ON public.clinics 
FOR SELECT 
USING (
  -- Admin global pode ver todas
  public.get_current_user_role() = 'admin'
  OR 
  -- Usuário criou a clínica
  created_by = auth.uid()
  OR 
  -- Usuário é staff da clínica
  EXISTS (
    SELECT 1 FROM public.clinic_staff cs 
    WHERE cs.clinic_id = id 
    AND cs.user_id = auth.uid() 
    AND cs.active = true
  )
);

CREATE POLICY "Users can manage accessible clinics" 
ON public.clinics 
FOR ALL 
USING (
  -- Admin global pode gerenciar todas
  public.get_current_user_role() = 'admin'
  OR 
  -- Usuário criou a clínica
  created_by = auth.uid()
  OR 
  -- Usuário é admin da clínica
  EXISTS (
    SELECT 1 FROM public.clinic_staff cs 
    WHERE cs.clinic_id = id 
    AND cs.user_id = auth.uid() 
    AND cs.is_admin = true
    AND cs.active = true
  )
);

-- 3. Recriar políticas para clinic_staff com lógica mais simples
CREATE POLICY "Users can view clinic staff" 
ON public.clinic_staff 
FOR SELECT 
USING (
  -- Admin global pode ver todos
  public.get_current_user_role() = 'admin'
  OR 
  -- Usuário pode ver seus próprios registros
  user_id = auth.uid()
  OR 
  -- Usuário é admin de alguma clínica e pode ver staff da mesma clínica
  EXISTS (
    SELECT 1 FROM public.clinic_staff cs2 
    WHERE cs2.clinic_id = clinic_id
    AND cs2.user_id = auth.uid()
    AND cs2.is_admin = true
    AND cs2.active = true
  )
);

CREATE POLICY "Users can manage clinic staff" 
ON public.clinic_staff 
FOR ALL 
USING (
  -- Admin global pode gerenciar todos
  public.get_current_user_role() = 'admin'
  OR 
  -- Usuário pode gerenciar seus próprios registros (limitado)
  (user_id = auth.uid() AND TG_OP = 'SELECT')
  OR 
  -- Usuário é admin de alguma clínica e pode gerenciar staff da mesma clínica
  EXISTS (
    SELECT 1 FROM public.clinic_staff cs2 
    WHERE cs2.clinic_id = clinic_id
    AND cs2.user_id = auth.uid()
    AND cs2.is_admin = true
    AND cs2.active = true
  )
);
