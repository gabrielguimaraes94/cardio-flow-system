
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ClinicCard } from './ClinicCard';
import { useClinic } from '@/contexts/ClinicContext';
import { Clinic, ClinicSummary } from '@/types/clinic';

export const ClinicSelector: React.FC = () => {
  const { selectedClinic, setSelectedClinic, clinics, loading } = useClinic();

  const handleSelectClinic = (clinic: ClinicSummary) => {
    // Ao selecionar uma clínica do resumo, ela é convertida para o tipo completo
    setSelectedClinic({
      ...clinic,
      address: 'Endereço não informado',
      phone: 'Telefone não informado',
      email: 'Email não informado'
    } as Clinic);
  };

  {/* Show loading state */}
  if (loading) {
    return (
      <Button variant="ghost" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="text-left">
          <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-2 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
        </div>
        <ChevronDown className="h-4 w-4 ml-1" />
      </Button>
    );
  }

  {/* Show empty state if no clinics or no selected clinic */}
  if (!selectedClinic || clinics.length === 0) {
    return (
      <Button variant="ghost" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 font-medium">?</span>
        </div>
        <div className="text-left">
          <div className="font-medium text-sm text-gray-500">
            {clinics.length === 0 ? 'Nenhuma clínica' : 'Selecione uma clínica'}
          </div>
          <div className="text-xs text-gray-400">
            {clinics.length === 0 ? 'Cadastre uma clínica' : 'Clique para selecionar'}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 ml-1" />
      </Button>
    );
  }

  {/* Render selected clinic */}
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-cardio-500 flex items-center justify-center">
            <span className="text-white font-medium">
              {selectedClinic.name?.charAt(0) || '?'}
            </span>
          </div>
          <div className="text-left">
            <div className="font-medium text-sm">{selectedClinic.name || 'Clínica sem nome'}</div>
            <div className="text-xs text-gray-500">{selectedClinic.city || ''}</div>
          </div>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500">Selecionar Clínica</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {clinics.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">
                Nenhuma clínica disponível
              </div>
            ) : (
              clinics.map((clinic) => (
                <ClinicCard 
                  key={clinic.id} 
                  clinic={clinic} 
                  isSelected={clinic.id === selectedClinic?.id} 
                  onSelect={() => handleSelectClinic({
                    id: clinic.id,
                    name: clinic.name,
                    city: clinic.city,
                    logo: clinic.logo
                  } as ClinicSummary)}
                />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
