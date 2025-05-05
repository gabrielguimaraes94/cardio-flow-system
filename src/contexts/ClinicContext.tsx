
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Clinic {
  id: string;
  name: string;
  city: string;
  logo?: string;
}

interface ClinicContextType {
  selectedClinic: Clinic | null;
  setSelectedClinic: (clinic: Clinic) => void;
  clinics: Clinic[];
}

const defaultClinic: Clinic = {
  id: '1',
  name: 'Cardio Center',
  city: 'São Paulo',
};

const ClinicContext = createContext<ClinicContextType>({
  selectedClinic: defaultClinic,
  setSelectedClinic: () => {},
  clinics: [],
});

export const useClinic = () => useContext(ClinicContext);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedClinic, setSelectedClinic] = useState<Clinic>(defaultClinic);
  const [clinics, setClinics] = useState<Clinic[]>([
    { id: '1', name: 'Cardio Center', city: 'São Paulo' },
    { id: '2', name: 'Instituto Cardiovascular', city: 'Rio de Janeiro' },
    { id: '3', name: 'Clínica do Coração', city: 'Belo Horizonte' },
  ]);

  // Persist selected clinic to localStorage
  useEffect(() => {
    const storedClinicId = localStorage.getItem('selectedClinicId');
    if (storedClinicId) {
      const clinic = clinics.find(c => c.id === storedClinicId);
      if (clinic) {
        setSelectedClinic(clinic);
      }
    }
  }, []);

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
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};
