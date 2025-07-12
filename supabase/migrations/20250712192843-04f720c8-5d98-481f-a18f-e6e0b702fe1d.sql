-- Remover o default 'doctor' da coluna role na tabela profiles
-- para que a função handle_new_user seja totalmente responsável por definir o role
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;