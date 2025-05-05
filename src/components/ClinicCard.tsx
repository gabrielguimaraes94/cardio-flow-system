
import React from 'react';
import { Check } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  city: string;
  logo?: string;
}

interface ClinicCardProps {
  clinic: Clinic;
  isSelected: boolean;
  onSelect: () => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, isSelected, onSelect }) => {
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-md cursor-pointer
        ${isSelected ? 'bg-cardio-50 border-cardio-300 border' : 'hover:bg-gray-50 border border-transparent'}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-cardio-500 flex items-center justify-center">
          <span className="text-white font-medium">{clinic.name.charAt(0)}</span>
        </div>
        <div>
          <div className="font-medium">{clinic.name}</div>
          <div className="text-xs text-gray-500">{clinic.city}</div>
        </div>
      </div>
      {isSelected && (
        <div className="h-5 w-5 rounded-full bg-cardio-500 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
};
