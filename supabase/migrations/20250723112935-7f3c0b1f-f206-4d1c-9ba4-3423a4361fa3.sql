-- Corrigir políticas RLS e trigger para permitir criação de usuários via edge functions

-- 1. Remover políticas RLS problemáticas que podem estar bloqueando inserções do sistema
DROP POLICY IF EXISTS "Allow system to create profiles" ON public.profiles;
DROP POLICY IF EXISTS "clinic_admin_can_insert_profiles" ON public.profiles;

-- 2. Criar política específica para permitir inserções do sistema/trigger
CREATE POLICY "system_can_insert_profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- 3. Verificar se o trigger on_auth_user_created existe e está ativo
DO $$
BEGIN
    -- Primeiro, remover o trigger se existir
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Recriar o trigger
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        
    RAISE NOTICE 'Trigger on_auth_user_created recriado com sucesso';
END $$;

-- 4. Verificar se o enum user_role existe (garantir que está disponível)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'admin',
            'clinic_admin', 
            'doctor',
            'nurse',
            'receptionist',
            'staff'
        );
        RAISE NOTICE 'Enum user_role criado';
    ELSE
        RAISE NOTICE 'Enum user_role já existe';
    END IF;
END $$;

-- 5. Verificar e corrigir a função handle_new_user se necessário
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