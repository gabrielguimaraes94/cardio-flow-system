
import React, { useState } from 'react';
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

export const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock patient data with their anamnesis history
  const patients = [
    { 
      id: '1', 
      name: 'João Silva', 
      age: 65, 
      cpf: '123.456.789-10', 
      phone: '(11) 98765-4321', 
      insurance: 'Unimed',
      anamneses: [
        { id: 'a1', date: '2023-10-15', doctor: 'Dr. Cardoso' },
        { id: 'a2', date: '2024-02-20', doctor: 'Dra. Santos' }
      ]
    },
    { 
      id: '2', 
      name: 'Maria Oliveira', 
      age: 72, 
      cpf: '234.567.890-12', 
      phone: '(11) 91234-5678', 
      insurance: 'Bradesco Saúde',
      anamneses: [
        { id: 'a3', date: '2023-11-05', doctor: 'Dr. Ferreira' }
      ] 
    },
    { 
      id: '3', 
      name: 'José Pereira', 
      age: 58, 
      cpf: '345.678.901-23', 
      phone: '(11) 99876-5432', 
      insurance: 'SulAmérica',
      anamneses: [] 
    },
    { 
      id: '4', 
      name: 'Antônia Souza', 
      age: 69, 
      cpf: '456.789.012-34', 
      phone: '(11) 94321-8765', 
      insurance: 'Amil',
      anamneses: [
        { id: 'a4', date: '2024-01-10', doctor: 'Dr. Oliveira' }
      ] 
    },
    { 
      id: '5', 
      name: 'Carlos Santos', 
      age: 55, 
      cpf: '567.890.123-45', 
      phone: '(11) 95678-1234', 
      insurance: 'Unimed',
      anamneses: [] 
    },
  ];

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

  const handleNewPatient = () => {
    navigate('/patients/new');
  };

  const filteredPatients = searchTerm
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf.includes(searchTerm) ||
        patient.phone.includes(searchTerm) ||
        patient.insurance.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : patients;

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
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Filtrar
          </Button>
        </div>

        <div className="rounded-md border overflow-x-auto">
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
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.cpf}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.insurance}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAnamnesisClick(patient.id, patient.anamneses)}
                            aria-label="Anamnese"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {patient.anamneses.length > 0 
                            ? `Ver anamnese (${patient.anamneses.length} registros)`
                            : "Criar anamnese"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

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
