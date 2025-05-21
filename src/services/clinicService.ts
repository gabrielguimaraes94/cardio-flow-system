
import { supabase } from '@/integrations/supabase/client';
import { Clinic } from '@/types/clinic';

/**
 * Service for handling clinic operations
 */
export const clinicService = {
  /**
   * Fetch clinics where the user has access (as owner or staff)
   */
  async getUserClinics(): Promise<Clinic[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        return [];
      }

      const userId = session.session.user.id;

      // Use our updated RPC function to get user clinics with all fields
      const { data, error } = await supabase.rpc('get_user_clinics', {
        user_uuid: userId
      });

      if (error) throw error;
      
      // Transform the result to match our Clinic interface
      const clinics: Clinic[] = data ? data.map((item: any) => ({
        id: item.clinic_id,
        name: item.clinic_name,
        city: item.clinic_city,
        address: item.clinic_address,
        phone: item.clinic_phone,
        email: item.clinic_email,
        logo_url: item.clinic_logo_url,
        active: true
      })) : [];
      
      return clinics;
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
