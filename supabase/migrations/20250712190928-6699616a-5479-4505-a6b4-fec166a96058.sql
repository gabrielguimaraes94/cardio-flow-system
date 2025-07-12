-- Atualizar a função handle_new_user para respeitar o role do metadata e definir is_first_login adequadamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_role text;
BEGIN
  -- Extrair o role do metadata ou usar 'doctor' como fallback
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'doctor');
  
  -- Inserir o profile com role do metadata e is_first_login baseado no role
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    crm, 
    role,
    is_first_login
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'first_name', ''), 
    COALESCE(new.raw_user_meta_data->>'last_name', ''), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'crm', ''),
    user_role::user_role,
    CASE 
      WHEN user_role IN ('admin', 'clinic_admin') THEN false
      ELSE true
    END
  );
  
  RETURN new;
END;
$$;