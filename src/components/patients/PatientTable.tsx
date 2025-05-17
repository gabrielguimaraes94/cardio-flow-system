
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/contexts/ClinicContext';

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

interface PatientTableProps {
  patients: Patient[];
  isLoading: boolean;
  onPatientDeleted: () => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({ 
  patients, 
  isLoading,
  onPatientDeleted 
}) => {
  const navigate = useNavigate();
  const { selectedClinic } = useClinic();
  const { toast } = useToast();

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
        
        toast({
          title: "Paciente excluído",
          description: "Paciente excluído com sucesso."
        });
        
        onPatientDeleted();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Carregando pacientes...</p>
      </div>
    );
  }

  return (
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
          {patients.length > 0 ? (
            patients.map((patient) => (
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
  );
};
