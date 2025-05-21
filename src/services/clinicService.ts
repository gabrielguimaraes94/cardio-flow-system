
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

      // Use our new RPC function to get user clinics
      const { data, error } = await supabase.rpc('get_user_clinics', {
        user_uuid: userId
      });

      if (error) throw error;
      
      // Transform the result to match our Clinic interface
      const clinics: Clinic[] = data ? data.map((item: any) => ({
        id: item.clinic_id,
        name: item.clinic_name,
        city: item.clinic_city || 'Cidade não informada',
        address: item.clinic_address || 'Endereço não informado',
        phone: item.clinic_phone || 'Telefone não informado',
        email: item.clinic_email || 'Email não informado',
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
      
      // Ensure required fields are present
      return data ? {
        ...data,
        address: data.address || 'Endereço não informado',
        phone: data.phone || 'Telefone não informado',
        city: data.city || 'Cidade não informada',
        email: data.email || 'Email não informado'
      } : null;
    } catch (error) {
      console.error('Error fetching clinic by ID:', error);
      return null;
    }
  }
};
