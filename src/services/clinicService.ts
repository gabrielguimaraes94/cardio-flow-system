
import { supabase } from '@/integrations/supabase/client';
import { Clinic } from '@/types/clinic';

interface UserClinicData {
  clinic_id: string;
  clinic_name: string;
  clinic_city: string;
  clinic_address: string;
  clinic_phone: string;
  clinic_email: string;
  clinic_logo_url: string | null;
  clinic_active: boolean;
  is_admin: boolean;
  staff_id: string | null;
  staff_role: string;
  staff_active: boolean;
}

/**
 * Service for handling clinic operations
 */
export const clinicService = {
  /**
   * Fetch clinics where the user has access (as owner or staff) using the optimized function
   */
  async getUserClinics(): Promise<{
    clinics: Clinic[];
    userClinics: Array<{
      id: string;
      name: string;
      city: string;
      logo?: string;
      staffId: string;
      is_admin: boolean;
    }>;
  }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        return { clinics: [], userClinics: [] };
      }

      const userId = session.session.user.id;

      // Use our updated RPC function to get user clinics with all fields
      const { data, error } = await supabase.rpc('get_user_clinics', {
        user_uuid: userId
      });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { clinics: [], userClinics: [] };
      }

      // Transform the result to match our interfaces
      const clinics: Clinic[] = data.map((item: UserClinicData) => ({
        id: item.clinic_id,
        name: item.clinic_name,
        city: item.clinic_city,
        address: item.clinic_address,
        phone: item.clinic_phone,
        email: item.clinic_email,
        logo_url: item.clinic_logo_url,
        active: item.clinic_active
      }));

      const userClinics = data.map((item: UserClinicData) => ({
        id: item.clinic_id,
        name: item.clinic_name,
        city: item.clinic_city,
        logo: item.clinic_logo_url || undefined,
        staffId: item.staff_id || 'global-admin',
        is_admin: item.is_admin
      }));
      
      return { clinics, userClinics };
    } catch (error) {
      console.error('Error fetching user clinics:', error);
      throw error;
    }
  },

  /**
   * Fetch a specific clinic by ID
   */
  async getClinicById(clinicId: string): Promise<Clinic | null> {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .eq('active', true)
        .single();

      if (error) throw error;
      
      return data ? {
        ...data,
        address: data.address,
        phone: data.phone,
        city: data.city,
        email: data.email
      } : null;
    } catch (error) {
      console.error('Error fetching clinic by ID:', error);
      return null;
    }
  }
};
