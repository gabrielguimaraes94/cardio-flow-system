-- Verificar e corrigir a política de inserção de profiles pelo trigger
-- Remover política antiga restritiva
DROP POLICY IF EXISTS "Allow system to create profiles" ON public.profiles;

-- Criar política específica para permitir inserções do sistema/trigger  
CREATE POLICY "Allow auth trigger to insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Garantir que a função handle_new_user tenha as permissões corretas
-- Recriar a função com as permissões adequadas
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
  
  -- Extrair e validar campos obrigatórios - NUNCA deixar vazio
  first_name_val := COALESCE(NULLIF(new.raw_user_meta_data->>'first_name', ''), 'Nome Pendente');
  last_name_val := COALESCE(NULLIF(new.raw_user_meta_data->>'last_name', ''), 'Sobrenome Pendente');  
  crm_val := COALESCE(NULLIF(new.raw_user_meta_data->>'crm', ''), 'Pendente');
  
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

-- Verificar se o trigger existe e recriar se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();