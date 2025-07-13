
-- Script completo: Limpar banco + Aplicar correções
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- PARTE 1: LIMPEZA DO BANCO
-- ========================================

-- ID do admin que deve ser mantido
DO $$
DECLARE
    admin_id uuid := 'b4542ae6-91f6-43b2-856b-3093ddb9df81';
BEGIN

-- Validação inicial
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
    RAISE EXCEPTION 'ERRO: Admin com ID % não encontrado! Operação cancelada.', admin_id;
END IF;

RAISE NOTICE 'Admin validado. Iniciando limpeza...';

-- 1. Limpar clinic_staff (exceto registros do admin)
DELETE FROM public.clinic_staff 
WHERE user_id != admin_id;

-- 2. Limpar clinics (exceto as criadas pelo admin)
DELETE FROM public.clinics 
WHERE created_by != admin_id;

-- 3. Limpar profiles (exceto o admin)
DELETE FROM public.profiles 
WHERE id != admin_id;

-- 4. Limpar auth.users (exceto o admin)
DELETE FROM auth.users 
WHERE id != admin_id;

-- 5. Limpar outras tabelas relacionadas
DELETE FROM public.patients;
DELETE FROM public.patient_addresses;
DELETE FROM public.anamnesis;
DELETE FROM public.angioplasty_requests;
DELETE FROM public.insurance_companies;
DELETE FROM public.insurance_contracts;
DELETE FROM public.insurance_form_configs;
DELETE FROM public.insurance_audit_rules;
DELETE FROM public.procedure_multiplication_factors;

-- 6. Verificar se o admin ainda existe
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
    RAISE EXCEPTION 'Admin não encontrado após limpeza!';
END IF;

-- 7. Verificar se o profile do admin ainda existe
IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_id) THEN
    RAISE EXCEPTION 'Profile do admin não encontrado após limpeza!';
END IF;

-- 8. Garantir que o admin tenha role 'admin'
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = admin_id;

-- 9. Verificar se há dados órfãos
DELETE FROM public.clinic_staff 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

DELETE FROM public.clinics 
WHERE created_by NOT IN (SELECT id FROM auth.users);

RAISE NOTICE 'Limpeza concluída com sucesso!';

END $$;

-- ========================================
-- PARTE 2: APLICAR CORREÇÕES
-- ========================================

-- 1. Remover constraint duplicada na clinic_staff
ALTER TABLE public.clinic_staff DROP CONSTRAINT IF EXISTS fk_clinic_staff_user;

-- 2. Corrigir a função handle_new_user para garantir campos obrigatórios
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

  -- Garantir que campos obrigatórios não sejam vazios
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

-- 3. Verificar se o trigger existe, se não, criar
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

-- 4. Remover políticas que podem estar bloqueando o trigger
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow trigger to insert" ON public.profiles;
DROP POLICY IF EXISTS "Allow trigger insertion" ON public.profiles;
DROP POLICY IF EXISTS "Allow system to create profiles" ON public.profiles;

-- 5. Criar política específica para permitir inserção via trigger
CREATE POLICY "Allow system to create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- ========================================
-- PARTE 3: VERIFICAÇÃO FINAL
-- ========================================

-- Verificar resultado da limpeza
SELECT 
  'Limpeza e correções concluídas!' as status,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.clinics) as total_clinics,
  (SELECT COUNT(*) FROM public.clinic_staff) as total_clinic_staff,
  (SELECT COUNT(*) FROM public.patients) as total_patients;

-- Verificar se o admin está correto
SELECT 
  'Admin verificação' as check_type,
  au.id as auth_user_id,
  au.email as auth_email,
  p.first_name,
  p.last_name,
  p.role as profile_role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.id = 'b4542ae6-91f6-43b2-856b-3093ddb9df81';

-- Verificar se a função handle_new_user foi corrigida
SELECT 
  'Função handle_new_user' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'handle_new_user' 
      AND prosrc LIKE '%Pendente%'
    ) THEN '✅ Função corrigida (usa Pendente como fallback)'
    ELSE '❌ Função não foi corrigida'
  END as function_status;

-- Verificar se o trigger existe
SELECT 
  'Trigger on_auth_user_created' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created' 
      AND tgenabled = 'O'
    ) THEN '✅ Trigger existe e está ativo'
    ELSE '❌ Trigger não existe ou está inativo'
  END as trigger_status;
