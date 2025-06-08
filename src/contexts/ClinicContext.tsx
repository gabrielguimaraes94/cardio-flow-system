
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Clinic } from '@/types/clinic';
import { useMe } from '@/hooks/useMe';

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
  const { clinics, isLoading, error, refetch } = useMe();

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
    if (isLoading || clinics.length === 0) return;

    console.log('ClinicContext: Processando seleção automática de clínica');
    
    // Verifica se já existe uma clínica selecionada no localStorage
    const storedClinicId = safeLocalStorage.getItem('selectedClinicId');
    
    if (storedClinicId) {
      // Busca a clínica atualizada na lista atual (isso garante dados atualizados)
      const updatedClinic = clinics.find(c => c.id === storedClinicId);
      
      if (updatedClinic) {
        // Se a clínica existe na lista, usa os dados atualizados
        console.log('ClinicContext: ✅ Atualizando clínica selecionada com dados mais recentes:', updatedClinic.name);
        handleSetSelectedClinic(updatedClinic);
      } else {
        console.log('ClinicContext: ❌ Clínica do localStorage não encontrada, selecionando primeira da lista');
        handleSetSelectedClinic(clinics[0]);
      }
    } else {
      console.log('ClinicContext: ⚠️ Nenhuma clínica no localStorage, selecionando primeira da lista');
      handleSetSelectedClinic(clinics[0]);
    }
  }, [clinics, isLoading]); // Dependência em clinics garante que sempre use dados atualizados

  // Efeito adicional para atualizar a clínica selecionada quando os dados das clínicas mudam
  useEffect(() => {
    if (selectedClinic && clinics.length > 0) {
      // Busca a versão atualizada da clínica selecionada
      const updatedSelectedClinic = clinics.find(c => c.id === selectedClinic.id);
      
      if (updatedSelectedClinic) {
        // Verifica se houve mudanças nos dados
        const hasChanges = JSON.stringify(selectedClinic) !== JSON.stringify(updatedSelectedClinic);
        
        if (hasChanges) {
          console.log('ClinicContext: 🔄 Dados da clínica selecionada foram atualizados:', updatedSelectedClinic.name);
          setSelectedClinic(updatedSelectedClinic);
          
          // Dispatch event para notificar outros componentes
          try {
            const event = new CustomEvent('clinicChanged', { 
              detail: { clinicId: updatedSelectedClinic.id, clinicName: updatedSelectedClinic.name } 
            });
            window.dispatchEvent(event);
          } catch (error) {
            console.warn('Failed to dispatch clinic change event:', error);
          }
        }
      }
    }
  }, [clinics, selectedClinic]);

  const handleSetSelectedClinic = (clinic: Clinic | null) => {
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
        loading: isLoading,
        refetchClinics: refetch,
        error
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};
