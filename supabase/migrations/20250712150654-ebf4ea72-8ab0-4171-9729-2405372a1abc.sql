-- Improved get_user_clinics function using UNION ALL for better performance
CREATE OR REPLACE FUNCTION public.get_user_clinics(user_uuid uuid)
RETURNS TABLE(
  clinic_id uuid, 
  clinic_name text, 
  clinic_city text,
  clinic_address text,
  clinic_phone text,
  clinic_email text,
  clinic_logo_url text,
  clinic_active boolean,
  is_admin boolean,
  staff_id uuid,
  staff_role text,
  staff_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Clínicas onde o usuário é staff
  SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    c.city as clinic_city,
    c.address as clinic_address,
    c.phone as clinic_phone,
    c.email as clinic_email,
    c.logo_url as clinic_logo_url,
    c.active as clinic_active,
    cs.is_admin,
    cs.id as staff_id,
    cs.role as staff_role,
    cs.active as staff_active
  FROM public.clinics c
  INNER JOIN public.clinic_staff cs ON c.id = cs.clinic_id
  WHERE cs.user_id = user_uuid
    AND cs.active = true
    AND c.active = true
  
  UNION ALL
  
  -- Se é admin global, inclui todas as outras clínicas ativas
  SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    c.city as clinic_city,
    c.address as clinic_address,
    c.phone as clinic_phone,
    c.email as clinic_email,
    c.logo_url as clinic_logo_url,
    c.active as clinic_active,
    TRUE as is_admin,
    NULL::uuid as staff_id,
    'global_admin'::text as staff_role,
    TRUE as staff_active
  FROM public.clinics c
  WHERE c.active = true
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = user_uuid AND role = 'admin')
    AND NOT EXISTS (
      SELECT 1 
      FROM public.clinic_staff cs 
      WHERE cs.clinic_id = c.id AND cs.user_id = user_uuid AND cs.active = true
    );
END;
$$;