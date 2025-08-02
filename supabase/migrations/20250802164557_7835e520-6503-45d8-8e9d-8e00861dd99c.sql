-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.angioplasty_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_form_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_multiplication_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_audit_rules ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_global_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_global_admin(auth.uid()));

-- Políticas para clinic_staff
CREATE POLICY "Staff can view their own clinic staff records" ON public.clinic_staff
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all clinic staff" ON public.clinic_staff
  FOR SELECT USING (public.is_global_admin(auth.uid()));

-- Políticas para clinics
CREATE POLICY "Everyone can read clinics" ON public.clinics
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage clinics" ON public.clinics
  FOR ALL USING (public.is_global_admin(auth.uid()));

-- Corrigir função com search_path seguro
CREATE OR REPLACE FUNCTION public.is_global_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_uuid 
    AND role = 'admin'
  );
$$;