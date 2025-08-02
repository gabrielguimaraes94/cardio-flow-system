-- Criar função para verificar se usuário é admin global
CREATE OR REPLACE FUNCTION public.is_global_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_uuid 
    AND role = 'admin'
  );
$$;