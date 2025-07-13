

-- Corrigir a função handle_new_user para validar campos obrigatórios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  user_role_text text;
  first_name_val text;
  last_name_val text;
  crm_val text;
BEGIN
  -- Extrair o role do metadata ou usar 'doctor' como fallback
  user_role_text := COALESCE(new.raw_user_meta_data->>'role', 'doctor');
  
  -- Verificar se o role é válido, senão usar 'doctor'
  IF user_role_text NOT IN ('admin', 'doctor', 'nurse', 'receptionist', 'clinic_admin', 'staff') THEN
    user_role_text := 'doctor';
  END IF;
  
  -- Extrair e validar campos obrigatórios
  first_name_val := COALESCE(NULLIF(new.raw_user_meta_data->>'first_name', ''), 'Nome');
  last_name_val := COALESCE(NULLIF(new.raw_user_meta_data->>'last_name', ''), 'Sobrenome');  
  crm_val := COALESCE(NULLIF(new.raw_user_meta_data->>'crm', ''), 'N/A');
  
  -- Inserir o profile com dados validados
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    crm,
    phone,
    title,
    bio,
    role,
    is_first_login
  )
  VALUES (
    new.id, 
    first_name_val,
    last_name_val,
    new.email, 
    crm_val,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'title', ''),
    COALESCE(new.raw_user_meta_data->>'bio', ''),
    user_role_text::user_role,
    CASE 
      WHEN user_role_text IN ('admin', 'clinic_admin') THEN false
      ELSE true
    END
  );
  
  RETURN new;
END;
$$;

