
-- Verificar e corrigir a função handle_new_user para usar o enum existente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  user_role_text text;
BEGIN
  -- Extrair o role do metadata ou usar 'doctor' como fallback
  user_role_text := COALESCE(new.raw_user_meta_data->>'role', 'doctor');
  
  -- Verificar se o role é válido, senão usar 'doctor'
  IF user_role_text NOT IN ('admin', 'doctor', 'nurse', 'receptionist', 'clinic_admin', 'staff') THEN
    user_role_text := 'doctor';
  END IF;
  
  -- Inserir o profile com role do metadata e is_first_login baseado no role
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
    COALESCE(new.raw_user_meta_data->>'first_name', ''), 
    COALESCE(new.raw_user_meta_data->>'last_name', ''), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'crm', ''),
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

-- Verificar se o trigger existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Remover a política problemática que pode estar bloqueando o trigger
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON public.profiles;
