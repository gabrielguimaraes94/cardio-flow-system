
import { useState, useEffect } from 'react';
import { clinicService } from '@/services/clinicService';
import { Clinic } from '@/types/clinic';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserClinic {
  id: string;
  name: string;
  city: string;
  logo?: string;
  staffId: string;
  is_admin: boolean;
}

interface UseUserClinicsReturn {
  clinics: Clinic[];
  userClinics: UserClinic[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserClinics = (): UseUserClinicsReturn => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [userClinics, setUserClinics] = useState<UserClinic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const fetchClinics = async () => {
    if (!user || authLoading) {
      setClinics([]);
      setUserClinics([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 useUserClinics: Buscando clínicas do usuário...');
      const { clinics: fetchedClinics, userClinics: fetchedUserClinics } = await clinicService.getUserClinics();
      console.log('📋 useUserClinics: Clínicas retornadas:', fetchedClinics);
      console.log('👥 useUserClinics: UserClinics retornadas:', fetchedUserClinics);
      
      setClinics(fetchedClinics);
      setUserClinics(fetchedUserClinics);
    } catch (error) {
      console.error('useUserClinics: Error fetching clinics:', error);
      setError('Erro ao carregar clínicas');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as clínicas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clinics when user changes or auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchClinics();
    }
  }, [user, authLoading]);

  return {
    clinics,
    userClinics,
    loading,
    error,
    refetch: fetchClinics
  };
};
