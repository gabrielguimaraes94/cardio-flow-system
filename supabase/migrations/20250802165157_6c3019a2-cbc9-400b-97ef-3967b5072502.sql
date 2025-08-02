-- Adicionar políticas básicas para as tabelas que estão faltando
CREATE POLICY "Basic read access" ON public.patients
  FOR SELECT USING (true);

CREATE POLICY "Basic read access" ON public.anamnesis  
  FOR SELECT USING (true);

CREATE POLICY "Basic read access" ON public.patient_addresses
  FOR SELECT USING (true);

CREATE POLICY "Basic read access" ON public.angioplasty_requests
  FOR SELECT USING (true);

CREATE POLICY "Basic read access" ON public.insurance_companies
  FOR SELECT USING (true);

CREATE POLICY "Basic read access" ON public.insurance_contracts
  FOR SELECT USING (true);

CREATE POLICY "Basic read access" ON public.insurance_form_configs
  FOR SELECT USING (true);

CREATE POLICY "Basic read access" ON public.procedure_multiplication_factors
  FOR SELECT USING (true);

CREATE POLICY "Basic read access" ON public.insurance_audit_rules
  FOR SELECT USING (true);