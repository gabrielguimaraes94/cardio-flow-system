
import { supabase } from '@/integrations/supabase/client';

export interface Clinic {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  active?: boolean;
}

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

      // First check if the user is a global admin
      const { data: isAdmin } = await supabase.rpc('is_global_admin', {
        user_uuid: userId
      });

      if (isAdmin) {
        // Global admins can see all clinics
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .eq('active', true);

        if (error) throw error;
        return data || [];
      }

      // Get clinics created by the user
      const { data: ownedClinics, error: ownedError } = await supabase
        .from('clinics')
        .select('*')
        .eq('created_by', userId)
        .eq('active', true);

      if (ownedError) throw ownedError;

      // Get clinics where user is staff - now using direct query without RLS recursion
      const { data: staffData, error: staffError } = await supabase
        .from('clinic_staff')
        .select('clinic_id')
        .eq('user_id', userId)
        .eq('active', true);

      if (staffError) throw staffError;

      // If user is staff at some clinics, fetch those clinics' details
      let staffClinics: Clinic[] = [];
      if (staffData && staffData.length > 0) {
        const clinicIds = staffData.map(staff => staff.clinic_id);
        const { data: clinicsData, error: clinicsError } = await supabase
          .from('clinics')
          .select('*')
          .in('id', clinicIds)
          .eq('active', true);

        if (clinicsError) throw clinicsError;
        staffClinics = clinicsData || [];
      }

      // Combine and deduplicate owned and staff clinics
      const combinedClinics = [...(ownedClinics || []), ...staffClinics];
      const uniqueClinicMap = new Map<string, Clinic>();
      
      combinedClinics.forEach(clinic => {
        uniqueClinicMap.set(clinic.id, clinic);
      });

      return Array.from(uniqueClinicMap.values());
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
      return data;
    } catch (error) {
      console.error('Error fetching clinic by ID:', error);
      return null;
    }
  }
};
