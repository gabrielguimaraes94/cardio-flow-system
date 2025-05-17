
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, Edit, Trash2, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { PatientFormModal } from '@/components/patients/PatientFormModal';

interface Patient {
  id: string;
  name: string;
  birthdate: string;
  cpf: string;
  phone: string | null;
  email: string | null;
  age?: number; // Calculado
  anamneses?: Array<{ id: string; date: string; doctor: string }>;
}

export const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedClinic } = useClinic();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Buscar pacientes quando a clínica selecionada mudar
  useEffect(() => {
    fetchPatients();
  }, [selectedClinic]);

  // Função para buscar pacientes
  const fetchPatients = async () => {
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
  };

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

  const handleNewPatient = () => {
    if (!selectedClinic) {
      toast({
        title: "Selecione uma clínica",
        description: "É necessário selecionar uma clínica antes de criar um novo paciente.",
        variant: "destructive"
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleAnamnesisClick = (patientId: string, anamneses: any[]) => {
    if (anamneses.length > 0) {
      // Open the most recent anamnesis
      const mostRecentAnamnesis = anamneses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      navigate(`/patients/${patientId}/anamnesis/${mostRecentAnamnesis.id}`);
    } else {
      // Create a new anamnesis if none exists
      navigate(`/patients/${patientId}/anamnesis/new`);
    }
  };

  const handleEditPatient = (patientId: string) => {
    navigate(`/patients/${patientId}/edit`);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (confirm("Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('id', patientId);

        if (error) throw error;

        setPatients(patients.filter(patient => patient.id !== patientId));
        setFilteredPatients(filteredPatients.filter(patient => patient.id !== patientId));
        
        toast({
          title: "Paciente excluído",
          description: "Paciente excluído com sucesso."
        });
      } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o paciente.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-1">Pacientes</h2>
            <p className="text-gray-500">Gerenciar cadastro de pacientes</p>
          </div>
          <Button className="bg-cardio-500 hover:bg-cardio-600" onClick={handleNewPatient}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="search" 
              placeholder="Buscar pacientes..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p>Carregando pacientes...</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.cpf}</TableCell>
                      <TableCell>{patient.phone || "-"}</TableCell>
                      <TableCell>{patient.email || "-"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAnamnesisClick(patient.id, patient.anamneses || [])}
                                aria-label="Anamnese"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {patient.anamneses && patient.anamneses.length > 0 
                                ? `Ver anamnese (${patient.anamneses.length} registros)`
                                : "Criar anamnese"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditPatient(patient.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePatient(patient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum paciente encontrado</p>
                      {!selectedClinic && (
                        <p className="text-sm mt-2">Selecione uma clínica para visualizar seus pacientes</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <PatientFormModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={fetchPatients}
        />
      </div>
    </Layout>
  );
};
