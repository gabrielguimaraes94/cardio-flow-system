-- Criar função add_clinic_staff para associar usuários às clínicas
CREATE OR REPLACE FUNCTION public.add_clinic_staff(
  p_user_id uuid,
  p_clinic_id uuid,
  p_is_admin boolean DEFAULT false,
  p_role text DEFAULT 'staff'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Verificar se a clínica existe
  IF NOT EXISTS (SELECT 1 FROM public.clinics WHERE id = p_clinic_id) THEN
    RAISE EXCEPTION 'Clínica não encontrada';
  END IF;

  -- Verificar se já existe uma relação
  IF EXISTS (
    SELECT 1 FROM public.clinic_staff 
    WHERE user_id = p_user_id AND clinic_id = p_clinic_id
  ) THEN
    -- Atualizar registro existente
    UPDATE public.clinic_staff 
    SET 
      is_admin = p_is_admin,
      role = p_role,
      active = true,
      updated_at = now()
    WHERE user_id = p_user_id AND clinic_id = p_clinic_id;
  ELSE
    -- Criar nova relação
    INSERT INTO public.clinic_staff (
      user_id,
      clinic_id,
      role,
      is_admin,
      active
    ) VALUES (
      p_user_id,
      p_clinic_id,
      p_role,
      p_is_admin,
      true
    );
  END IF;
END;
$$;