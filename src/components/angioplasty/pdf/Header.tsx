
import React from 'react';
import { Clinic } from '@/types/clinic';

interface HeaderProps {
  clinic: Clinic;
}

export const Header: React.FC<HeaderProps> = ({ clinic }) => {
  return (
    <div className="flex justify-between items-start mb-8">
      <div className="max-w-[70%]">
        <h1 className="text-xl font-bold">{clinic.name}</h1>
        <p className="text-sm">{clinic.address}</p>
        <p className="text-sm">{clinic.city || localStorage.getItem('clinicCity') || 'São Paulo'}</p>
        <p className="text-sm">Tel: {clinic.phone}</p>
        {clinic.email && <p className="text-sm">Email: {clinic.email}</p>}
      </div>
      {clinic.logo_url && (
        <div className="w-24 h-24 flex items-center justify-center">
          <img 
            src={clinic.logo_url} 
            alt={`${clinic.name} Logo`} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};
