
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Clinic } from '@/types/clinic';
import { useToast } from '@/hooks/use-toast';
import { useUserClinics } from '@/hooks/useUserClinics';

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
  const { clinics, loading, error, refetch } = useUserClinics();
  const { toast } = useToast();

  // Função para validar se uma clínica ainda existe na lista atual
  const validateStoredClinic = (storedClinicId: string, availableClinics: Clinic[]): Clinic | null => {
    const clinic = availableClinics.find(c => c.id === storedClinicId);
    if (!clinic) {
      console.log('ClinicContext: Clínica armazenada não encontrada na lista atual, removendo do localStorage');
      safeLocalStorage.removeItem('selectedClinicId');
      return null;
    }
    return clinic;
  };

  // Auto-select clinic logic when clinics are loaded
  useEffect(() => {
    if (loading || clinics.length === 0) return;

    // Se já há uma clínica selecionada válida, não faz nada
    if (selectedClinic && clinics.find(c => c.id === selectedClinic.id)) {
      return;
    }

    console.log('ClinicContext: Processando seleção automática de clínica');
    
    // Verifica se já existe uma clínica selecionada no localStorage
    const storedClinicId = safeLocalStorage.getItem('selectedClinicId');
    
    if (storedClinicId) {
      // Valida se a clínica armazenada ainda existe na lista atual
      const validClinic = validateStoredClinic(storedClinicId, clinics);
      
      if (validClinic) {
        console.log('ClinicContext: ✅ Restaurando clínica válida do localStorage:', validClinic.name);
        handleSetSelectedClinic(validClinic);
      } else {
        console.log('ClinicContext: ❌ Clínica do localStorage inválida, selecionando primeira da lista');
        handleSetSelectedClinic(clinics[0]);
      }
    } else {
      console.log('ClinicContext: ⚠️ Nenhuma clínica no localStorage, selecionando primeira da lista');
      handleSetSelectedClinic(clinics[0]);
    }
  }, [clinics, loading]);

  const handleSetSelectedClinic = (clinic: Clinic | null) => {
    // Evita loops desnecessários se a clínica já está selecionada
    if (selectedClinic?.id === clinic?.id) {
      console.log('ClinicContext: 🔄 Clínica já selecionada, ignorando mudança');
      return;
    }
    
    console.log('ClinicContext: 🔄 Alterando clínica selecionada para:', clinic?.name || 'nenhuma');
    
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
        refetchClinics: refetch,
        error
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};
