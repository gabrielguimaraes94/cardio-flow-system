-- Adicionar campo is_first_login na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN is_first_login BOOLEAN DEFAULT true;

-- Atualizar registros existentes para false (já fizeram login)
UPDATE public.profiles 
SET is_first_login = false 
WHERE is_first_login IS NULL;

-- Função para verificar primeiro login
CREATE OR REPLACE FUNCTION public.is_user_first_login(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(is_first_login, false) FROM public.profiles WHERE id = user_uuid;
$$;

-- Função para marcar primeiro login como concluído
CREATE OR REPLACE FUNCTION public.mark_first_login_complete(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET is_first_login = false 
  WHERE id = user_uuid;
END;
$$;