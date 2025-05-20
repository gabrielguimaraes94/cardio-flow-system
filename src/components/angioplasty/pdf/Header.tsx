
import React from 'react';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  city?: string;
  email?: string;
}

interface HeaderProps {
  clinic: Clinic;
}

export const Header: React.FC<HeaderProps> = ({ clinic }) => {
  return (
    <div className="flex justify-between items-start mb-8">
      <div className="max-w-[100%]">
        <h1 className="text-xl font-bold">{clinic.name}</h1>
        <p className="text-sm">{clinic.address}</p>
        {clinic.city && <p className="text-sm">{clinic.city}</p>}
        <p className="text-sm">Tel: {clinic.phone}</p>
        {clinic.email && <p className="text-sm">Email: {clinic.email}</p>}
      </div>
    </div>
  );
};
