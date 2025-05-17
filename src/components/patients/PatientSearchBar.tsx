
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PatientSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const PatientSearchBar: React.FC<PatientSearchBarProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          type="search" 
          placeholder="Buscar pacientes..." 
          className="pl-9" 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
