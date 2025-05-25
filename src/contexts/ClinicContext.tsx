
import React, { createContext, useContext, useState, useEffect } from 'react';
import { clinicService } from '@/services/clinicService';
import { Clinic } from '@/types/clinic';
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

// Função auxiliar para acessar localStorage com segurança
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('LocalStorage access denied:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('LocalStorage write denied:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('LocalStorage remove denied:', error);
    }
  }
};

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

  // Função para validar se uma clínica ainda existe na lista atual
  const validateStoredClinic = (storedClinicId: string, availableClinics: Clinic[]): Clinic | null => {
    const clinic = availableClinics.find(c => c.id === storedClinicId);
    if (!clinic) {
      console.log('Clínica armazenada não encontrada na lista atual, removendo do localStorage');
      safeLocalStorage.removeItem('selectedClinicId');
      return null;
    }
    return clinic;
  };

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
        const storedClinicId = safeLocalStorage.getItem('selectedClinicId');
        
        if (storedClinicId) {
          // Valida se a clínica armazenada ainda existe na lista atual
          const validClinic = validateStoredClinic(storedClinicId, clinicsData);
          
          if (validClinic) {
            console.log('Restaurando clínica válida do localStorage:', validClinic.name);
            handleSetSelectedClinic(validClinic);
          } else {
            console.log('Clínica do localStorage inválida, selecionando primeira da lista');
            handleSetSelectedClinic(clinicsData[0]);
          }
        } else {
          console.log('Nenhuma clínica no localStorage, selecionando primeira da lista');
          handleSetSelectedClinic(clinicsData[0]);
        }
      } else {
        console.log('Nenhuma clínica encontrada para o usuário');
        setClinics([]);
        setSelectedClinic(null);
        safeLocalStorage.removeItem('selectedClinicId');
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
    // Evita loops desnecessários se a clínica já está selecionada
    if (selectedClinic?.id === clinic?.id) {
      return;
    }
    
    console.log('Alterando clínica selecionada para:', clinic?.name || 'nenhuma');
    setSelectedClinic(clinic);
    
    if (clinic) {
      safeLocalStorage.setItem('selectedClinicId', clinic.id);
      
      // Dispatch a custom event that components can listen for
      try {
        const event = new CustomEvent('clinicChanged', { 
          detail: { clinicId: clinic.id, clinicName: clinic.name } 
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.warn('Failed to dispatch clinic change event:', error);
      }
    } else {
      safeLocalStorage.removeItem('selectedClinicId');
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
