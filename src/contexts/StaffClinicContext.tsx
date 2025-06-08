
import React, { createContext, useContext } from 'react';
import { useMe } from '@/hooks/useMe';

interface StaffClinicContextType {
  userClinics: {
    id: string;
    name: string;
    city: string;
    logo?: string;
    staffId: string;
    is_admin: boolean;
  }[];
  fetchUserClinics: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const StaffClinicContext = createContext<StaffClinicContextType>({
  userClinics: [],
  fetchUserClinics: async () => {},
  loading: true,
  error: null,
});

export const useStaffClinic = () => {
  const context = useContext(StaffClinicContext);
  if (!context) {
    throw new Error('useStaffClinic must be used within StaffClinicProvider');
  }
  return context;
};

export const StaffClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userClinics, isLoading, error, refetch } = useMe();

  return (
    <StaffClinicContext.Provider
      value={{
        userClinics,
        fetchUserClinics: refetch,
        loading: isLoading,
        error
      }}
    >
      {children}
    </StaffClinicContext.Provider>
  );
};
