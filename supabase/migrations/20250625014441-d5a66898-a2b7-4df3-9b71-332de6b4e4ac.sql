
-- Simplificar completamente as políticas RLS - apenas admin tem acesso total

-- 1. Remover todas as políticas existentes
DO $$ 
DECLARE 
    pol_name text;
    table_name text;
BEGIN
    -- Lista de tabelas para limpar políticas
    FOR table_name IN VALUES ('clinics'), ('clinic_staff'), ('profiles'), ('patients'), ('anamnesis'), ('angioplasty_requests'), ('insurance_companies'), ('insurance_contracts'), ('insurance_form_configs'), ('insurance_audit_rules'), ('procedure_multiplication_factors'), ('patient_addresses')
    LOOP
        FOR pol_name IN 
            SELECT policyname FROM pg_policies WHERE tablename = table_name AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name, table_name);
        END LOOP;
    END LOOP;
END $$;

-- 2. Criar política única e simples para cada tabela - ADMIN TEM ACESSO TOTAL
CREATE POLICY "admin_full_access" ON public.clinics FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.clinic_staff FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.profiles FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.patients FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.anamnesis FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.angioplasty_requests FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.insurance_companies FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.insurance_contracts FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.insurance_form_configs FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.insurance_audit_rules FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.procedure_multiplication_factors FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "admin_full_access" ON public.patient_addresses FOR ALL USING (public.get_current_user_role() = 'admin');

-- 3. Criar função para buscar dados de qualquer tabela (apenas para admins)
CREATE OR REPLACE FUNCTION public.admin_get_table_data(table_name text, limit_count integer DEFAULT 100)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    query_text text;
BEGIN
    -- Verificar se o usuário é admin
    IF public.get_current_user_role() != 'admin' THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
    END IF;
    
    -- Construir query dinamicamente
    query_text := format('SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM public.%I ORDER BY created_at DESC LIMIT %s) t', table_name, limit_count);
    
    -- Executar query
    EXECUTE query_text INTO result;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;
