
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

  // Lógica de seleção de clínica - APENAS para usuários com UMA clínica
  useEffect(() => {
    if (isLoading || clinics.length === 0) return;

    console.log('ClinicContext: Processando seleção de clínica', { clinicsCount: clinics.length });
    
    // Se há apenas UMA clínica, seleciona automaticamente
    if (clinics.length === 1) {
      console.log('ClinicContext: Uma clínica encontrada, selecionando automaticamente:', clinics[0].name);
      handleSetSelectedClinic(clinics[0]);
      return;
    }

    // Se há múltiplas clínicas, NÃO faz seleção automática
    // Apenas tenta restaurar do localStorage se houver uma clínica previamente selecionada
    if (clinics.length > 1) {
      console.log('ClinicContext: Múltiplas clínicas encontradas, verificando localStorage');
      
      const storedClinicId = safeLocalStorage.getItem('selectedClinicId');
      if (storedClinicId) {
        const storedClinic = clinics.find(c => c.id === storedClinicId);
        if (storedClinic) {
          console.log('ClinicContext: Restaurando clínica do localStorage:', storedClinic.name);
          setSelectedClinic(storedClinic);
        } else {
          console.log('ClinicContext: Clínica do localStorage não encontrada, removendo');
          safeLocalStorage.removeItem('selectedClinicId');
        }
      } else {
        console.log('ClinicContext: Nenhuma clínica no localStorage para múltiplas clínicas');
      }
    }
  }, [clinics, isLoading]);

  // Efeito para atualizar a clínica selecionada quando os dados das clínicas mudam
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
