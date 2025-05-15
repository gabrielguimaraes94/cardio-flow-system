
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { useClinic } from './ClinicContext';

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
  const { user } = useAuth();
  const { setSelectedClinic } = useClinic();

  const fetchUserClinics = async () => {
    if (!user) {
      setUserClinics([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all clinics where the user is a staff member
      const { data: staffData, error: staffError } = await supabase
        .from('clinic_staff')
        .select('id, clinic_id, is_admin')
        .eq('user_id', user.id)
        .eq('active', true);

      if (staffError) {
        throw staffError;
      }

      if (staffData && staffData.length > 0) {
        // Get all clinic IDs the user is associated with
        const clinicIds = staffData.map(staff => staff.clinic_id);

        // Fetch clinic details
        const { data: clinicsData, error: clinicsError } = await supabase
          .from('clinics')
          .select('*')
          .in('id', clinicIds)
          .eq('active', true);

        if (clinicsError) {
          throw clinicsError;
        }

        // Combine staff and clinic data
        const userClinicsData = clinicsData.map(clinic => {
          const staffRecord = staffData.find(staff => staff.clinic_id === clinic.id);
          return {
            id: clinic.id,
            name: clinic.name,
            city: clinic.city,
            logo: clinic.logo || undefined,
            staffId: staffRecord?.id || '',
            is_admin: staffRecord?.is_admin || false
          };
        });

        setUserClinics(userClinicsData);
        
        // If there's at least one clinic, select the first one by default
        if (userClinicsData.length > 0) {
          const storedClinicId = localStorage.getItem('selectedClinicId');
          const defaultClinic = userClinicsData.find(c => c.id === storedClinicId) || userClinicsData[0];
          
          setSelectedClinic({
            id: defaultClinic.id,
            name: defaultClinic.name,
            city: defaultClinic.city,
            logo: defaultClinic.logo
          });
        } else {
          setSelectedClinic(null);
        }
      } else {
        setUserClinics([]);
        setSelectedClinic(null);
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

  // Fetch clinics when user changes
  useEffect(() => {
    fetchUserClinics();
  }, [user]);

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
