-- Remover funções obsoletas que causam conflitos
DROP FUNCTION IF EXISTS public.create_user_by_admin(text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_user_by_admin_temp(text, text, text, text, text, text, text, text);