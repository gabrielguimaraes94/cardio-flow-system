
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { z } from 'zod';

// Schema para validação dos dados do paciente
export const patientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  birthdate: z.string().or(z.date()),
  gender: z.string().min(1, { message: 'Gênero é obrigatório' }),
  cpf: z.string().min(1, { message: 'CPF é obrigatório' }),
  rg: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email({ message: 'Email inválido' }).nullable().optional(),
  age: z.number().optional(),
});

// Tipo do paciente inferido do schema
export type PatientContextType = z.infer<typeof patientSchema>;

interface PatientContextProps {
  selectedPatient: PatientContextType | null;
  setSelectedPatient: (patient: PatientContextType | null) => void;
  clearSelectedPatient: () => void;
  resetPatientSelection: () => void;
}

const PatientContext = createContext<PatientContextProps | undefined>(undefined);

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPatient, setSelectedPatientState] = useState<PatientContextType | null>(null);

  const setSelectedPatient = (patient: PatientContextType | null) => {
    console.log('Selecionando paciente:', patient?.name || 'nenhum');
    setSelectedPatientState(patient);
  };

  const clearSelectedPatient = () => {
    console.log('Limpando paciente selecionado');
    setSelectedPatientState(null);
  };

  const resetPatientSelection = () => {
    console.log('Resetando seleção de paciente');
    setSelectedPatientState(null);
  };

  return (
    <PatientContext.Provider value={{ 
      selectedPatient, 
      setSelectedPatient, 
      clearSelectedPatient,
      resetPatientSelection 
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = (): PatientContextProps => {
  const context = useContext(PatientContext);
  
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  
  return context;
};
