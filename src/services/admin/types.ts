import { Database } from '@/integrations/supabase/types';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Database["public"]["Enums"]["user_role"];
  created_at: string;
  updated_at: string;
  phone: string | null;
  crm: string;
  title: string | null;
  bio: string | null;
  notification_preferences: any;
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
  trading_name: string | null;
  cnpj: string | null;
  logo_url: string | null;
}

export interface UserFilters {
  role?: Database["public"]["Enums"]["user_role"];
  search?: string;
  active?: boolean;
}

export interface ClinicFilters {
  city?: string;
  active?: boolean;
  search?: string;
}

export interface RegisterClinicRequest {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  trading_name?: string;
  cnpj?: string;
}

export interface CreateClinicParams {
  p_name: string;
  p_city: string;
  p_address: string;
  p_phone: string;
  p_email: string;
  p_created_by: string;
  p_trading_name?: string;
  p_cnpj?: string;
}