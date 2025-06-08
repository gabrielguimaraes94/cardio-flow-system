
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { clinicService } from '@/services/clinicService';
import { Clinic } from '@/types/clinic';
import { useToast } from '@/hooks/use-toast';

interface UserClinic {
  id: string;
  name: string;
  city: string;
  logo?: string;
  staffId: string;
  is_admin: boolean;
}

interface UseMeReturn {
  user: User | null;
  userClinics: UserClinic[];
  clinics: Clinic[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMe = (): UseMeReturn => {
  const { user, isLoading: authLoading } = useAuth();
  const [userClinics, setUserClinics] = useState<UserClinic[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserData = async () => {
    if (!user || authLoading) {
      setUserClinics([]);
      setClinics([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 useMe: Buscando dados completos do usuário...');
      const { clinics: fetchedClinics, userClinics: fetchedUserClinics } = await clinicService.getUserClinics();
      
      console.log('📋 useMe: Clínicas retornadas:', fetchedClinics);
      console.log('👥 useMe: UserClinics retornadas:', fetchedUserClinics);
      
      setClinics(fetchedClinics);
      setUserClinics(fetchedUserClinics);
    } catch (error) {
      console.error('useMe: Erro ao buscar dados do usuário:', error);
      setError('Erro ao carregar dados do usuário');
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  return {
    user,
    userClinics,
    clinics,
    isLoading: authLoading || loading,
    error,
    refetch: fetchUserData
  };
};
