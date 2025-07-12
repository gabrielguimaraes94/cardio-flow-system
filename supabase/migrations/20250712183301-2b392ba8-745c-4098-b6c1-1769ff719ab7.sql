-- Remover política antiga muito restritiva
DROP POLICY IF EXISTS "admin_full_access" ON public.profiles;

-- Nova política para admin global (mantém acesso total)
CREATE POLICY "global_admin_full_access_profiles"
ON public.profiles
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- Política para admin de clínica inserir usuários
CREATE POLICY "clinic_admin_can_insert_profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  public.get_current_user_role() = 'admin'
  OR public.is_any_clinic_admin()
);

-- Política para admin de clínica visualizar usuários (para pesquisa)
CREATE POLICY "clinic_admin_can_select_profiles"
ON public.profiles
FOR SELECT
USING (
  public.get_current_user_role() = 'admin'
  OR id = auth.uid() -- Próprio perfil
  OR public.is_any_clinic_admin() -- Admin de clínica pode pesquisar
);

-- Política para usuários editarem próprio perfil
CREATE POLICY "users_can_manage_own_profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());