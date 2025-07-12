-- Remover políticas antigas muito restritivas
DROP POLICY IF EXISTS "admin_full_access" ON public.clinic_staff;
DROP POLICY IF EXISTS "admin_full_access" ON public.profiles;

-- POLÍTICAS PARA CLINIC_STAFF
-- Admin global tem acesso total
CREATE POLICY "global_admin_full_access_clinic_staff"
ON public.clinic_staff
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- Admin de clínica pode inserir funcionários na sua própria clínica
CREATE POLICY "clinic_admin_can_add_staff_to_own_clinic"
ON public.clinic_staff
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.clinic_id = clinic_id
      AND cs.user_id = auth.uid()
      AND cs.is_admin = true
      AND cs.active = true
  )
);

-- Admin de clínica pode visualizar funcionários da sua clínica
CREATE POLICY "clinic_admin_can_view_own_clinic_staff"
ON public.clinic_staff
FOR SELECT
USING (
  public.get_current_user_role() = 'admin'
  OR EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.clinic_id = clinic_id
      AND cs.user_id = auth.uid()
      AND cs.is_admin = true
      AND cs.active = true
  )
  OR user_id = auth.uid() -- Usuário pode ver seus próprios registros
);

-- Admin de clínica pode atualizar funcionários da sua clínica (para soft delete)
CREATE POLICY "clinic_admin_can_update_own_clinic_staff"
ON public.clinic_staff
FOR UPDATE
USING (
  public.get_current_user_role() = 'admin'
  OR EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.clinic_id = clinic_id
      AND cs.user_id = auth.uid()
      AND cs.is_admin = true
      AND cs.active = true
  )
);

-- POLÍTICAS PARA PROFILES
-- Admin global tem acesso total
CREATE POLICY "global_admin_full_access_profiles"
ON public.profiles
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- Usuários podem visualizar e editar apenas o próprio perfil
CREATE POLICY "users_can_manage_own_profile"
ON public.profiles
FOR ALL
USING (id = auth.uid());

-- Admin de clínica pode visualizar profiles para pesquisar e associar
CREATE POLICY "clinic_admin_can_view_profiles_for_search"
ON public.profiles
FOR SELECT
USING (
  public.get_current_user_role() = 'admin'
  OR id = auth.uid() -- Próprio perfil
  OR EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.user_id = auth.uid()
      AND cs.is_admin = true
      AND cs.active = true
  )
);

-- POLÍTICAS PARA CLINICS
-- Admin global tem acesso total
CREATE POLICY "global_admin_full_access_clinics"
ON public.clinics
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- Admin de clínica pode visualizar e editar apenas sua própria clínica
CREATE POLICY "clinic_admin_can_manage_own_clinic"
ON public.clinics
FOR ALL
USING (
  public.get_current_user_role() = 'admin'
  OR EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.clinic_id = id
      AND cs.user_id = auth.uid()
      AND cs.is_admin = true
      AND cs.active = true
  )
);

-- Funcionários podem visualizar clínicas às quais estão associados
CREATE POLICY "staff_can_view_associated_clinics"
ON public.clinics
FOR SELECT
USING (
  public.get_current_user_role() = 'admin'
  OR EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.clinic_id = id
      AND cs.user_id = auth.uid()
      AND cs.active = true
  )
);