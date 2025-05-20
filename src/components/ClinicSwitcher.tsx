
import React, { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';

interface ClinicCardProps {
  id: string;
  name: string;
  city: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ClinicCard: React.FC<ClinicCardProps> = ({ name, city, isSelected, onSelect }) => {
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-md cursor-pointer
        ${isSelected ? 'bg-cardio-50 border-cardio-300 border' : 'hover:bg-gray-50 border border-transparent'}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-cardio-500 flex items-center justify-center">
          <span className="text-white font-medium">{name.charAt(0)}</span>
        </div>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{city}</div>
        </div>
      </div>
      {isSelected && (
        <div className="h-5 w-5 rounded-full bg-cardio-500 flex items-center justify-center">
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export const ClinicSwitcher: React.FC = () => {
  const { selectedClinic, clinics, setSelectedClinic, loading, refetchClinics } = useClinic();
  const { toast } = useToast();
  
  // Verificar ao montar se há uma clínica selecionada
  useEffect(() => {
    if (!selectedClinic && clinics.length > 0) {
      // Se não tiver clínica selecionada, mas houver clínicas disponíveis
      console.log('ClinicSwitcher: Nenhuma clínica selecionada, mas existem clínicas disponíveis');
      refetchClinics();
    }
  }, [selectedClinic, clinics]);

  const handleSelectClinic = (clinicId: string) => {
    if (selectedClinic?.id === clinicId) return;
    
    const clinic = clinics.find(c => c.id === clinicId);
    if (!clinic) return;
    
    setSelectedClinic(clinic);
    toast({
      title: "Clínica alterada",
      description: `Você está agora visualizando ${clinic.name}.`,
    });
  };

  // Show loading state
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

  // Show empty state if no clinics or no selected clinic
  if (!selectedClinic || clinics.length === 0) {
    return (
      <Button 
        variant="ghost" 
        className="flex items-center gap-2"
        onClick={() => refetchClinics()}
      >
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 font-medium">?</span>
        </div>
        <div className="text-left">
          <div className="font-medium text-sm text-gray-500">
            {clinics.length === 0 ? 'Nenhuma clínica' : 'Selecione uma clínica'}
          </div>
          <div className="text-xs text-gray-400">
            {clinics.length === 0 ? 'Sem acesso a clínicas' : 'Clique para selecionar'}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 ml-1" />
      </Button>
    );
  }

  // Render selected clinic
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
                Você não tem acesso a nenhuma clínica
              </div>
            ) : (
              clinics.map((clinic) => (
                <ClinicCard 
                  key={clinic.id} 
                  id={clinic.id}
                  name={clinic.name}
                  city={clinic.city}
                  isSelected={clinic.id === selectedClinic?.id} 
                  onSelect={() => handleSelectClinic(clinic.id)}
                />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
