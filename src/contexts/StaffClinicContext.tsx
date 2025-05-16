
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { useClinic } from './ClinicContext';
import { z } from 'zod';

interface ClinicStaff {
  id: string;
  clinic_id: string;
  user_id: string;
  role: string;
  is_admin: boolean;
  active: boolean;
}

interface StaffClinicContextType {
  userClinics: {
    id: string;
    name: string;
    city: string;
    logo?: string;
    staffId: string;
    is_admin: boolean;
  }[];
  fetchUserClinics: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const StaffClinicContext = createContext<StaffClinicContextType>({
  userClinics: [],
  fetchUserClinics: async () => {},
  loading: true,
  error: null,
});

export const useStaffClinic = () => {
  const context = useContext(StaffClinicContext);
  if (!context) {
    throw new Error('useStaffClinic must be used within StaffClinicProvider');
  }
  return context;
};

export const StaffClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userClinics, setUserClinics] = useState<{
    id: string;
    name: string;
    city: string;
    logo?: string;
    staffId: string;
    is_admin: boolean;
  }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { setSelectedClinic } = useClinic();

  const fetchUserClinics = async () => {
    if (!user || authLoading) {
      setUserClinics([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First check if user is global admin
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      let clinicsData = [];
      
      if (isAdmin) {
        // Global admins can see all clinics
        const { data: allClinics, error: clinicsError } = await supabase
          .from('clinics')
          .select('*')
          .eq('active', true);
        
        if (clinicsError) throw clinicsError;
        
        // Format data for global admin - they're admin for all clinics
        clinicsData = allClinics.map(clinic => ({
          id: clinic.id,
          name: clinic.name,
          city: clinic.city,
          logo: clinic.logo_url || undefined,
          staffId: 'global-admin', // Placeholder since they're not in clinic_staff
          is_admin: true
        }));
      } else {
        // Regular users only see clinics they have access to via clinic_staff
        const { data: staffData, error: staffError } = await supabase
          .from('clinic_staff')
          .select('id, clinic_id, is_admin')
          .eq('user_id', user.id)
          .eq('active', true);

        if (staffError) throw staffError;

        if (staffData && staffData.length > 0) {
          // Get all clinic IDs the user is associated with
          const clinicIds = staffData.map(staff => staff.clinic_id);

          // Fetch clinic details
          const { data: clinicsData, error: clinicsError } = await supabase
            .from('clinics')
            .select('*')
            .in('id', clinicIds)
            .eq('active', true);

          if (clinicsError) throw clinicsError;

          // Combine staff and clinic data
          clinicsData = clinicsData.map(clinic => {
            const staffRecord = staffData.find(staff => staff.clinic_id === clinic.id);
            return {
              id: clinic.id,
              name: clinic.name,
              city: clinic.city,
              logo: clinic.logo_url || undefined,
              staffId: staffRecord?.id || '',
              is_admin: staffRecord?.is_admin || false
            };
          });
        }
      }

      setUserClinics(clinicsData);
      
      // Auto-select clinic logic:
      // 1. If only one clinic is available, select it automatically
      // 2. Otherwise, try to restore previous selection from localStorage
      if (clinicsData.length === 1) {
        // Auto-select the only clinic
        const onlyClinic = clinicsData[0];
        setSelectedClinic({
          id: onlyClinic.id,
          name: onlyClinic.name,
          city: onlyClinic.city,
          logo: onlyClinic.logo
        });
        
        // Save to localStorage
        localStorage.setItem('selectedClinicId', onlyClinic.id);
        
        toast({
          title: "Clínica selecionada",
          description: `${onlyClinic.name} foi automaticamente selecionada.`,
        });
      } else if (clinicsData.length > 1) {
        // Try to restore previous selection
        const storedClinicId = localStorage.getItem('selectedClinicId');
        const defaultClinic = clinicsData.find(c => c.id === storedClinicId) || clinicsData[0];
        
        setSelectedClinic({
          id: defaultClinic.id,
          name: defaultClinic.name,
          city: defaultClinic.city,
          logo: defaultClinic.logo
        });
      } else {
        // No clinics available
        setSelectedClinic(null);
        localStorage.removeItem('selectedClinicId');
      }
    } catch (error) {
      console.error('Error fetching user clinics:', error);
      setError('Erro ao carregar clínicas do usuário');
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas clínicas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clinics when user changes or auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchUserClinics();
    }
  }, [user, authLoading]);

  return (
    <StaffClinicContext.Provider
      value={{
        userClinics,
        fetchUserClinics,
        loading,
        error
      }}
    >
      {children}
    </StaffClinicContext.Provider>
  );
};
