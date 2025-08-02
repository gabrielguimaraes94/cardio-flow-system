-- Criar função para verificar se usuário é admin da clínica
CREATE OR REPLACE FUNCTION public.is_clinic_admin(clinic_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.clinic_staff 
    WHERE clinic_id = clinic_uuid 
    AND user_id = user_uuid 
    AND is_admin = true 
    AND active = true
  );
$$;

-- Adicionar políticas para clinic_staff permitindo que admin da clínica gerencie staff
CREATE POLICY "Clinic admins can view clinic staff" ON public.clinic_staff
  FOR SELECT USING (
    public.is_global_admin(auth.uid()) OR 
    public.is_clinic_admin(clinic_id, auth.uid())
  );

CREATE POLICY "Clinic admins can insert clinic staff" ON public.clinic_staff
  FOR INSERT WITH CHECK (
    public.is_global_admin(auth.uid()) OR 
    public.is_clinic_admin(clinic_id, auth.uid())
  );

CREATE POLICY "Clinic admins can update clinic staff" ON public.clinic_staff
  FOR UPDATE USING (
    public.is_global_admin(auth.uid()) OR 
    public.is_clinic_admin(clinic_id, auth.uid())
  );

CREATE POLICY "Clinic admins can delete clinic staff" ON public.clinic_staff
  FOR DELETE USING (
    public.is_global_admin(auth.uid()) OR 
    public.is_clinic_admin(clinic_id, auth.uid())
  );

-- Adicionar política para profiles permitindo que clinic_admin visualize perfis dos seus funcionários
CREATE POLICY "Clinic admins can view staff profiles" ON public.profiles
  FOR SELECT USING (
    public.is_global_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.clinic_staff cs1, public.clinic_staff cs2
      WHERE cs1.user_id = auth.uid() 
      AND cs1.is_admin = true 
      AND cs1.active = true
      AND cs2.user_id = profiles.id
      AND cs2.clinic_id = cs1.clinic_id
      AND cs2.active = true
    )
  );

-- Permitir que admins de clínica criem perfis
CREATE POLICY "Clinic admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    public.is_global_admin(auth.uid()) OR 
    (auth.uid() IS NOT NULL)
  );