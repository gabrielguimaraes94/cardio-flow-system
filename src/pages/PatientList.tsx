
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, Edit, Trash2, FileText, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const patients = [
    { id: '1', name: 'João Silva', age: 65, cpf: '123.456.789-10', phone: '(11) 98765-4321', insurance: 'Unimed' },
    { id: '2', name: 'Maria Oliveira', age: 72, cpf: '234.567.890-12', phone: '(11) 91234-5678', insurance: 'Bradesco Saúde' },
    { id: '3', name: 'José Pereira', age: 58, cpf: '345.678.901-23', phone: '(11) 99876-5432', insurance: 'SulAmérica' },
    { id: '4', name: 'Antônia Souza', age: 69, cpf: '456.789.012-34', phone: '(11) 94321-8765', insurance: 'Amil' },
    { id: '5', name: 'Carlos Santos', age: 55, cpf: '567.890.123-45', phone: '(11) 95678-1234', insurance: 'Unimed' },
  ];

  const handleSelectPatient = (patientId: string, patientName: string) => {
    localStorage.setItem('selectedPatientId', patientId);
    localStorage.setItem('selectedPatientName', patientName);
    
    toast({
      title: "Paciente selecionado",
      description: `${patientName} foi selecionado. Agora você pode acessar a anamnese.`,
    });
  };

  const handleAnamnesisClick = (patientId: string) => {
    navigate(`/patients/${patientId}/anamnesis`);
  };

  const handleNewPatient = () => {
    navigate('/patients/new');
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
            <Input type="search" placeholder="Buscar pacientes..." className="pl-9" />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Filtrar
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.cpf}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.insurance}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSelectPatient(patient.id, patient.name)}
                      title="Selecionar paciente"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAnamnesisClick(patient.id)}
                      title="Abrir anamnese"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};
