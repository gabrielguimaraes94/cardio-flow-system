
import { useState, useEffect, useCallback } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parseISO } from 'date-fns';

interface Patient {
  id: string;
  name: string;
  birthdate: string;
  cpf: string;
  phone: string | null;
  email: string | null;
  age?: number;
  anamneses?: Array<{ id: string; date: string; doctor: string }>;
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { selectedClinic } = useClinic();
  const { toast } = useToast();

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = parseISO(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchPatients = useCallback(async () => {
    if (!selectedClinic) {
      setPatients([]);
      setFilteredPatients([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', selectedClinic.id);

      if (error) throw error;

      if (data) {
        // Adicionar cálculo de idade para cada paciente
        const patientsWithAge = data.map(patient => ({
          ...patient,
          age: calculateAge(patient.birthdate),
          anamneses: [] // Placeholder para futuras anameses
        }));

        setPatients(patientsWithAge);
        setFilteredPatients(patientsWithAge);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pacientes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedClinic, toast]);

  // Buscar pacientes quando a clínica selecionada mudar
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filtrar pacientes com base no termo de pesquisa
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf.includes(searchTerm) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  return { 
    patients: filteredPatients, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    fetchPatients
  };
};
