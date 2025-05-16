
import React, { createContext, useContext, useState, useEffect } from 'react';
import { clinicService, Clinic } from '@/services/clinicService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, isLoading: authLoading } = useAuth();

  const fetchClinics = async () => {
    if (!user || authLoading) {
      setClinics([]);
      setSelectedClinic(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const clinicsData = await clinicService.getUserClinics();
      
      if (clinicsData && clinicsData.length > 0) {
        setClinics(clinicsData);
        
        // Verifica se já existe uma clínica selecionada no localStorage
        const storedClinicId = localStorage.getItem('selectedClinicId');
        
        // Se existir uma clínica no localStorage e ela estiver na lista, seleciona ela
        // Caso contrário, seleciona a primeira da lista
        if (storedClinicId && clinicsData.find(c => c.id === storedClinicId)) {
          const matchingClinic = clinicsData.find(c => c.id === storedClinicId);
          handleSetSelectedClinic(matchingClinic || clinicsData[0]);
        } else {
          handleSetSelectedClinic(clinicsData[0]);
        }
      } else {
        setClinics([]);
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
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

  // Fetch clinics when user changes
  useEffect(() => {
    if (!authLoading) {
      fetchClinics();
    }
  }, [user, authLoading]);

  const handleSetSelectedClinic = (clinic: Clinic | null) => {
    setSelectedClinic(clinic);
    
    if (clinic) {
      try {
        localStorage.setItem('selectedClinicId', clinic.id);
        
        // Dispatch a custom event that components can listen for
        const event = new CustomEvent('clinicChanged', { 
          detail: { clinicId: clinic.id, clinicName: clinic.name } 
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.warn('Failed to save selected clinic to localStorage:', error);
      }
    } else {
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
