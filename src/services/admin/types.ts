
import { Database } from '@/integrations/supabase/types';
import { UserProfile } from '@/types/profile';

// Tipos para a função registerClinic
export type AdminData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
  role: 'clinic_admin';
  crm?: string;
};

export type ClinicData = {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  tradingName?: string;
  cnpj?: string;
};

export interface CreateClinicResponse {
  id: string;
}

export type CreateClinicParams = {
  p_name: string;
  p_city: string;
  p_address: string;
  p_phone: string;
  p_email: string;
  p_created_by: string;
  p_trading_name?: string;
  p_cnpj?: string;
}

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
