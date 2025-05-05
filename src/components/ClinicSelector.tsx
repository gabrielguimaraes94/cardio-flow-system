
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ClinicCard } from './ClinicCard';

interface Clinic {
  id: string;
  name: string;
  city: string;
  logo?: string;
}

export const ClinicSelector: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<Clinic>({
    id: '1',
    name: 'Cardio Center',
    city: 'São Paulo',
  });

  const clinics: Clinic[] = [
    { id: '1', name: 'Cardio Center', city: 'São Paulo' },
    { id: '2', name: 'Instituto Cardiovascular', city: 'Rio de Janeiro' },
    { id: '3', name: 'Clínica do Coração', city: 'Belo Horizonte' },
  ];

  const handleSelectClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-cardio-500 flex items-center justify-center">
            <span className="text-white font-medium">{selectedClinic.name.charAt(0)}</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-sm">{selectedClinic.name}</div>
            <div className="text-xs text-gray-500">{selectedClinic.city}</div>
          </div>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500">Selecionar Clínica</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {clinics.map((clinic) => (
              <ClinicCard 
                key={clinic.id} 
                clinic={clinic} 
                isSelected={clinic.id === selectedClinic.id} 
                onSelect={() => handleSelectClinic(clinic)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
