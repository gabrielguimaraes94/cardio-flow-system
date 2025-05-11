import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Clinic {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
  logo?: string;
}

interface ClinicContextType {
  selectedClinic: Clinic | null;
  setSelectedClinic: (clinic: Clinic | null) => void;
  clinics: Clinic[];
  loading: boolean;
  refetchClinics: () => Promise<void>;
  error: string | null;
}

const ClinicContext = createContext<ClinicContextType>({
  selectedClinic: null,
  setSelectedClinic: () => {},
  clinics: [],
  loading: true,
  refetchClinics: async () => {},
  error: null,
});

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within ClinicProvider');
  }
  return context;
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchClinics = async () => {
    if (!user) {
      setClinics([]);
      setSelectedClinic(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('created_by', user.id)
        .eq('active', true);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setClinics(data);
        
        {/* If no clinic is selected, or the selected clinic is not in the list, select the first one */}
        if (!selectedClinic || !data.find(c => c.id === selectedClinic.id)) {
          handleSetSelectedClinic(data[0]);
        }
      } else {
        setClinics([]);
        setSelectedClinic(null);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
      setError('Erro ao carregar clínicas');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as clínicas.",
        variant: "destructive"
      });
      setClinics([]);
      setSelectedClinic(null);
    } finally {
      setLoading(false);
    }
  };

  {/* Fetch clinics when user changes */}
  useEffect(() => {
    fetchClinics();
  }, [user]);

  {/* Restore selected clinic from localStorage */}
  useEffect(() => {
    const storedClinicId = localStorage.getItem('selectedClinicId');
    
    if (storedClinicId && clinics.length > 0) {
      const clinic = clinics.find(c => c.id === storedClinicId);
      if (clinic) {
        setSelectedClinic(clinic);
      } else {
        {/* If the stored clinic is not found, reset storage */}
        localStorage.removeItem('selectedClinicId');
      }
    }
  }, [clinics]);

  const handleSetSelectedClinic = (clinic: Clinic | null) => {
    setSelectedClinic(clinic);
    
    if (clinic) {
      {/* Save to localStorage with error handling */}
      try {
        localStorage.setItem('selectedClinicId', clinic.id);
        
        {/* Dispatch a custom event that components can listen for */}
        const event = new CustomEvent('clinicChanged', { detail: { clinicId: clinic.id } });
        window.dispatchEvent(event);
      } catch (error) {
        console.warn('Failed to save selected clinic to localStorage:', error);
      }
    } else {
      {/* Remove from localStorage when clinic is null */}
      try {
        localStorage.removeItem('selectedClinicId');
      } catch (error) {
        console.warn('Failed to remove selected clinic from localStorage:', error);
      }
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        selectedClinic,
        setSelectedClinic: handleSetSelectedClinic,
        clinics,
        loading,
        refetchClinics: fetchClinics,
        error
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};
