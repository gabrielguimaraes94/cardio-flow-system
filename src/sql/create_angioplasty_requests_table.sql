
-- This SQL file contains the migration that should be run after the component code is implemented

-- Create angioplasty_requests table
CREATE TABLE IF NOT EXISTS public.angioplasty_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  patient_name TEXT NOT NULL,
  insurance_id UUID NOT NULL REFERENCES public.insurance_companies(id),
  insurance_name TEXT NOT NULL,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  request_number TEXT NOT NULL,
  coronary_angiography TEXT NOT NULL,
  proposed_treatment TEXT NOT NULL,
  tuss_procedures JSONB NOT NULL DEFAULT '[]'::jsonb,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  surgical_team JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  CONSTRAINT fk_patient_id FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT fk_insurance_id FOREIGN KEY (insurance_id) REFERENCES public.insurance_companies(id),
  CONSTRAINT fk_clinic_id FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);

-- Add index for faster querying by patient
CREATE INDEX IF NOT EXISTS idx_angioplasty_requests_patient_id ON public.angioplasty_requests (patient_id);
CREATE INDEX IF NOT EXISTS idx_angioplasty_requests_clinic_id ON public.angioplasty_requests (clinic_id);

-- Add Row Level Security policies
ALTER TABLE public.angioplasty_requests ENABLE ROW LEVEL SECURITY;

-- Policy for clinic staff to view records for their clinic
CREATE POLICY angioplasty_requests_select_policy ON public.angioplasty_requests 
FOR SELECT 
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.clinic_staff 
    WHERE user_id = auth.uid() AND active = true
  )
);

-- Policy for clinic staff to insert records for their clinic
CREATE POLICY angioplasty_requests_insert_policy ON public.angioplasty_requests 
FOR INSERT 
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id FROM public.clinic_staff 
    WHERE user_id = auth.uid() AND active = true
  )
);
