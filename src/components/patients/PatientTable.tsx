
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, FilePlus, Trash2, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePatient } from '@/contexts/PatientContext';
import { calculateAge } from '@/lib/utils';

interface Patient {
  id: string;
  name: string;
  birthdate: string;
  cpf: string;
  phone: string | null;
  email: string | null;
  age?: number;
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
  const { toast } = useToast();
  const { setSelectedPatient } = usePatient();
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditPatient = (patient: Patient) => {
    navigate(`/patients/${patient.id}/edit`);
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Paciente ${patientToDelete.name} excluído com sucesso.`,
      });
      onPatientDeleted();
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o paciente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setPatientToDelete(null);
    }
  };

  const handleCreateAnamnesis = (patient: Patient) => {
    // Set the selected patient and navigate to anamnesis page
    const patientWithAge = {
      ...patient,
      age: patient.birthdate ? calculateAge(parseISO(patient.birthdate)) : undefined
    };
    
    setSelectedPatient(patientWithAge);
    navigate(`/patients/${patient.id}/anamnesis/new`);
  };

  const handleViewHistory = (patient: Patient) => {
    navigate(`/patients/${patient.id}/history`);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Nasc.</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[120px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Nasc.</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>
                    {patient.birthdate && format(parseISO(patient.birthdate), 'dd/MM/yyyy')}
                    {patient.age ? ` (${patient.age} anos)` : ''}
                  </TableCell>
                  <TableCell>{patient.cpf}</TableCell>
                  <TableCell>{patient.phone || patient.email || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEditPatient(patient)}
                        title="Editar paciente"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleCreateAnamnesis(patient)}
                        title="Nova anamnese"
                      >
                        <FilePlus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleViewHistory(patient)}
                        title="Histórico"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setPatientToDelete(patient)}
                        title="Excluir paciente"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente {patientToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePatient}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
