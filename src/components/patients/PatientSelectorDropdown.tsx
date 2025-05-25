
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, User, UserCheck } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useToast } from '@/hooks/use-toast';
import { PatientContextType } from '@/contexts/PatientContext';
import { format } from 'date-fns';

interface PatientSelectorDropdownProps {
  selectedPatient: PatientContextType | null;
  onPatientSelect: (patient: PatientContextType) => void;
  onChangePatient?: () => void;
}

export const PatientSelectorDropdown: React.FC<PatientSelectorDropdownProps> = ({
  selectedPatient,
  onPatientSelect,
  onChangePatient
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { patients, isLoading, searchTerm, setSearchTerm } = usePatients();
  const { toast } = useToast();

  const handleSelectPatient = (patient: any) => {
    const formattedPatient: PatientContextType = {
      ...patient,
      age: patient.age || 0
    };
    
    onPatientSelect(formattedPatient);
    setIsDialogOpen(false);
    
    toast({
      title: "Paciente selecionado",
      description: `${patient.name} foi selecionado para anamnese.`,
    });
  };

  const handleChangePatient = () => {
    if (onChangePatient) {
      onChangePatient();
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      {selectedPatient ? (
        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <UserCheck className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="font-medium text-green-900">{selectedPatient.name}</p>
            <p className="text-sm text-green-700">
              {selectedPatient.age} anos • CPF: {selectedPatient.cpf}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleChangePatient}
          >
            Trocar Paciente
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <User className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="font-medium text-gray-700">Nenhum paciente selecionado</p>
            <p className="text-sm text-gray-500">
              Selecione um paciente para continuar com a anamnese
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Search className="h-4 w-4 mr-2" />
            Selecionar Paciente
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Paciente</DialogTitle>
            <DialogDescription>
              Pesquise e selecione o paciente para anamnese
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pesquisar paciente</Label>
              <Input
                id="search"
                type="text"
                placeholder="Nome, CPF, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Carregando pacientes...</div>
              </div>
            ) : patients.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">
                  {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                </div>
              </div>
            ) : (
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">
                          {patient.age} anos • CPF: {patient.cpf}
                        </p>
                        {patient.phone && (
                          <p className="text-sm text-gray-500">Tel: {patient.phone}</p>
                        )}
                        {patient.email && (
                          <p className="text-sm text-gray-500">Email: {patient.email}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(patient.birthdate), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
