-- Remover políticas antigas problemáticas
DROP POLICY IF EXISTS "admin_full_access" ON public.clinic_staff;
DROP POLICY IF EXISTS "admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "admin_full_access" ON public.clinics;
DROP POLICY IF EXISTS "clinic_admin_can_add_staff_to_own_clinic" ON public.clinic_staff;
DROP POLICY IF EXISTS "clinic_admin_can_view_own_clinic_staff" ON public.clinic_staff;
DROP POLICY IF EXISTS "clinic_admin_can_update_own_clinic_staff" ON public.clinic_staff;
DROP POLICY IF EXISTS "global_admin_full_access_clinic_staff" ON public.clinic_staff;
DROP POLICY IF EXISTS "global_admin_full_access_profiles" ON public.profiles;
DROP POLICY IF EXISTS "global_admin_full_access_clinics" ON public.clinics;
DROP POLICY IF EXISTS "clinic_admin_can_manage_own_clinic" ON public.clinics;
DROP POLICY IF EXISTS "staff_can_view_associated_clinics" ON public.clinics;
DROP POLICY IF EXISTS "clinic_admin_can_view_profiles_for_search" ON public.profiles;
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON public.profiles;

-- Criar funções auxiliares para evitar subqueries nas policies
CREATE OR REPLACE FUNCTION public.is_clinic_admin_for_clinic(clinic_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.clinic_id = clinic_uuid
      AND cs.user_id = auth.uid()
      AND cs.is_admin = true
      AND cs.active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_any_clinic_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.user_id = auth.uid()
      AND cs.is_admin = true
      AND cs.active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_of_clinic(clinic_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.clinic_id = clinic_uuid
      AND cs.user_id = auth.uid()
      AND cs.active = true
  );
$$;

-- POLÍTICAS PARA CLINIC_STAFF
-- Admin global tem acesso total (SEM subquery)
CREATE POLICY "global_admin_full_access_clinic_staff"
ON public.clinic_staff
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- Admin de clínica pode inserir funcionários na sua própria clínica
CREATE POLICY "clinic_admin_can_add_staff_to_own_clinic"
ON public.clinic_staff
FOR INSERT
WITH CHECK (public.is_clinic_admin_for_clinic(clinic_id));

-- Admin de clínica pode visualizar funcionários da sua clínica
CREATE POLICY "clinic_admin_can_view_own_clinic_staff"
ON public.clinic_staff
FOR SELECT
USING (
  public.is_clinic_admin_for_clinic(clinic_id)
  OR user_id = auth.uid() -- Usuário pode ver seus próprios registros
);

-- Admin de clínica pode atualizar funcionários da sua clínica
CREATE POLICY "clinic_admin_can_update_own_clinic_staff"
ON public.clinic_staff
FOR UPDATE
USING (public.is_clinic_admin_for_clinic(clinic_id));

-- POLÍTICAS PARA PROFILES
-- Admin global tem acesso total (SEM subquery)
CREATE POLICY "global_admin_full_access_profiles"
ON public.profiles
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- Usuários podem visualizar apenas o próprio perfil
CREATE POLICY "users_can_view_own_profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Usuários podem atualizar apenas o próprio perfil
CREATE POLICY "users_can_update_own_profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- Admin de clínica pode visualizar profiles para pesquisar e associar
CREATE POLICY "clinic_admin_can_view_profiles_for_search"
ON public.profiles
FOR SELECT
USING (public.is_any_clinic_admin());

-- POLÍTICAS PARA CLINICS
-- Admin global tem acesso total (SEM subquery)
CREATE POLICY "global_admin_full_access_clinics"
ON public.clinics
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- Admin de clínica pode visualizar e editar apenas sua própria clínica
CREATE POLICY "clinic_admin_can_view_own_clinic"
ON public.clinics
FOR SELECT
USING (public.is_clinic_admin_for_clinic(id));

CREATE POLICY "clinic_admin_can_update_own_clinic"
ON public.clinics
FOR UPDATE
USING (public.is_clinic_admin_for_clinic(id));

-- Funcionários podem visualizar clínicas às quais estão associados
CREATE POLICY "staff_can_view_associated_clinics"
ON public.clinics
FOR SELECT
USING (public.is_staff_of_clinic(id));