
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

  console.log("ClinicProvider initialized");
  console.log("Initial user:", user);

  const fetchClinics = async () => {
    console.log("Fetching clinics for user:", user?.id);
    
    if (!user) {
      console.log("No user, clearing clinic data");
      setClinics([]);
      setSelectedClinic(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching clinics from database for user:", user.id);
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('created_by', user.id)
        .eq('active', true);

      if (error) {
        throw error;
      }

      console.log("Clinics fetched:", data);

      if (data && data.length > 0) {
        setClinics(data);
        
        // Verifica se já existe uma clínica selecionada no localStorage
        const storedClinicId = localStorage.getItem('selectedClinicId');
        console.log("Found stored clinic ID:", storedClinicId);
        
        // Se existir uma clínica no localStorage e ela estiver na lista, seleciona ela
        // Caso contrário, seleciona a primeira da lista
        if (storedClinicId && data.find(c => c.id === storedClinicId)) {
          const matchingClinic = data.find(c => c.id === storedClinicId);
          console.log("Using previously selected clinic:", matchingClinic);
          handleSetSelectedClinic(matchingClinic || data[0]);
        } else {
          console.log("No matching stored clinic found, selecting first clinic:", data[0]);
          handleSetSelectedClinic(data[0]);
        }
      } else {
        console.log("No clinics found");
        setClinics([]);
        setSelectedClinic(null);
        localStorage.removeItem('selectedClinicId');
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
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

  // Fetch clinics when user changes
  useEffect(() => {
    console.log("User changed, fetching clinics");
    fetchClinics();
  }, [user]);

  const handleSetSelectedClinic = (clinic: Clinic | null) => {
    console.log("Setting selected clinic to:", clinic);
    setSelectedClinic(clinic);
    
    if (clinic) {
      try {
        console.log("Saving clinic ID to localStorage:", clinic.id);
        localStorage.setItem('selectedClinicId', clinic.id);
        
        // Dispatch a custom event that components can listen for
        const event = new CustomEvent('clinicChanged', { detail: { clinicId: clinic.id } });
        window.dispatchEvent(event);
      } catch (error) {
        console.warn('Failed to save selected clinic to localStorage:', error);
      }
    } else {
      console.log("Removing clinic ID from localStorage");
      try {
        localStorage.removeItem('selectedClinicId');
      } catch (error) {
        console.warn('Failed to remove selected clinic from localStorage:', error);
      }
    }
  };

  // Debug output for current clinic state
  useEffect(() => {
    console.log("Current ClinicContext state - selectedClinic:", selectedClinic);
    console.log("Current ClinicContext state - clinics:", clinics);
  }, [selectedClinic, clinics]);

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
