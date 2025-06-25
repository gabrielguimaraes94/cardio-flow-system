
import { Database } from '@/integrations/supabase/types';
import { UserProfile } from '@/types/profile';

// Tipos simplificados para registerClinic
export interface RegisterClinicRequest {
  admin: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string | null;
    crm?: string;
    role: 'clinic_admin';
  };
  clinic: {
    name: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    tradingName?: string;
    cnpj?: string;
  };
}

// Tipos para a função create_clinic
export type CreateClinicParams = {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  createdBy: string;
  tradingName?: string;
  cnpj?: string;
};

export type AddClinicStaffParams = {
  p_user_id: string;
  p_clinic_id: string;
  p_is_admin: boolean;
  p_role: string;
}

export interface AdminClinic {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  logo_url: string | null;
  tradingName?: string;
  cnpj?: string;
}

export interface AdminUser extends UserProfile {
  created_at: string;
  updated_at: string;
}

export type ClinicFilters = {
  active?: boolean;
  city?: string;
  name?: string;
  createdAfter?: string;
  createdBefore?: string;
};

export type UserFilters = {
  role?: Database['public']['Enums']['user_role'];
  createdAfter?: string;
  createdBefore?: string;
  name?: string;
};
