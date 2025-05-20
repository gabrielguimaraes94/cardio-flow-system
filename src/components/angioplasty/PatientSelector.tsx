
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { usePatients } from '@/hooks/usePatients';
import { format } from 'date-fns';
import { z } from 'zod';

interface PatientSelectorProps {
  onPatientSelect: (patient: any) => void;
  selectedValue?: string;
}

const patientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  birthdate: z.string().min(1),
});

export const PatientSelector: React.FC<PatientSelectorProps> = ({ 
  onPatientSelect,
  selectedValue
}) => {
  const { patients, isLoading, setSearchTerm } = usePatients();
  const [searchInput, setSearchInput] = useState('');
  
  // Filter patients in real-time based on search input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput, setSearchTerm]);

  const handlePatientChange = (patientId: string) => {
    if (!patientId) return;
    
    const selectedPatient = patients.find(p => p.id === patientId);
    if (selectedPatient) {
      onPatientSelect(selectedPatient);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Buscar paciente por nome ou CPF"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="mb-2"
      />
      
      <Select value={selectedValue} onValueChange={handlePatientChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um paciente" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {isLoading ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Carregando pacientes...
            </div>
          ) : patients.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Nenhum paciente encontrado
            </div>
          ) : (
            patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id || "unknown-id"}>
                {patient.name} - {format(new Date(patient.birthdate), 'dd/MM/yyyy')}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
