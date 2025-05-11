
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
  setSelectedClinic: (clinic: Clinic) => void;
  clinics: Clinic[];
  loading: boolean;
  refetchClinics: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType>({
  selectedClinic: null,
  setSelectedClinic: () => {},
  clinics: [],
  loading: true,
  refetchClinics: async () => {},
});

export const useClinic = () => useContext(ClinicContext);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchClinics = async () => {
    if (!user) {
      setClinics([]);
      setSelectedClinic(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
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
        
        // Se não houver clínica selecionada, selecione a primeira da lista
        if (!selectedClinic || !data.find(c => c.id === selectedClinic.id)) {
          handleSetSelectedClinic(data[0]);
        }
      } else {
        setClinics([]);
        setSelectedClinic(null);
      }
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as clínicas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clinics when user changes
  useEffect(() => {
    fetchClinics();
  }, [user]);

  // Restore selected clinic from localStorage
  useEffect(() => {
    const storedClinicId = localStorage.getItem('selectedClinicId');
    
    if (storedClinicId && clinics.length > 0) {
      const clinic = clinics.find(c => c.id === storedClinicId);
      if (clinic) {
        setSelectedClinic(clinic);
      }
    }
  }, [clinics]);

  const handleSetSelectedClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    localStorage.setItem('selectedClinicId', clinic.id);
    
    // Dispatch a custom event that components can listen for
    const event = new CustomEvent('clinicChanged', { detail: { clinicId: clinic.id } });
    window.dispatchEvent(event);
  };

  return (
    <ClinicContext.Provider
      value={{
        selectedClinic,
        setSelectedClinic: handleSetSelectedClinic,
        clinics,
        loading,
        refetchClinics: fetchClinics
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};
