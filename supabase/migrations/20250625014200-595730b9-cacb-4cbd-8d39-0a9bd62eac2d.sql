
-- Limpar completamente todas as políticas RLS e recriar sem recursão

-- 1. Remover TODAS as políticas existentes das duas tabelas
DO $$ 
DECLARE 
    pol_name text;
BEGIN
    -- Remover todas as políticas da tabela clinics
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'clinics' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.clinics', pol_name);
    END LOOP;
    
    -- Remover todas as políticas da tabela clinic_staff  
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'clinic_staff' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.clinic_staff', pol_name);
    END LOOP;
END $$;

-- 2. Criar políticas simples para clínicas (sem referência circular)
CREATE POLICY "clinics_select_policy" 
ON public.clinics 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin'
  OR created_by = auth.uid()
);

CREATE POLICY "clinics_all_policy" 
ON public.clinics 
FOR ALL 
USING (
  public.get_current_user_role() = 'admin'
  OR created_by = auth.uid()
);

-- 3. Criar políticas simples para clinic_staff (sem referência circular)
CREATE POLICY "clinic_staff_select_policy" 
ON public.clinic_staff 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin'
  OR user_id = auth.uid()
);

CREATE POLICY "clinic_staff_all_policy" 
ON public.clinic_staff 
FOR ALL 
USING (
  public.get_current_user_role() = 'admin'
);
