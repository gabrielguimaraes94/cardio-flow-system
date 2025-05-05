
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, FilePlus, Eye, Printer } from 'lucide-react';

export const CatheterizationReportList: React.FC = () => {
  const reports = [
    { 
      id: '1', 
      patient: 'João Silva', 
      date: '02/05/2025', 
      doctor: 'Dr. Carlos Silva',
      diagnosis: 'Lesão grave em ADA proximal'
    },
    { 
      id: '2', 
      patient: 'Maria Oliveira', 
      date: '28/04/2025', 
      doctor: 'Dr. Roberto Almeida',
      diagnosis: 'Coronárias sem lesões obstrutivas'
    },
    { 
      id: '3', 
      patient: 'José Pereira', 
      date: '25/04/2025', 
      doctor: 'Dra. Ana Santos',
      diagnosis: 'Lesão moderada em CD média'
    },
    { 
      id: '4', 
      patient: 'Antônia Souza', 
      date: '20/04/2025', 
      doctor: 'Dr. Carlos Silva',
      diagnosis: 'Lesão em bifurcação ACX/OM1'
    },
    { 
      id: '5', 
      patient: 'Fernando Gomes', 
      date: '15/04/2025', 
      doctor: 'Dr. Roberto Almeida',
      diagnosis: 'Doença arterial coronariana grave'
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-1">Relatórios de Cateterismo</h2>
            <p className="text-gray-500">Visualize e crie relatórios de cateterismo</p>
          </div>
          <Button className="bg-cardio-500 hover:bg-cardio-600">
            <FilePlus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input type="search" placeholder="Buscar relatórios..." className="pl-9" />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Filtrar
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.patient}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.doctor}</TableCell>
                  <TableCell className="max-w-xs truncate">{report.diagnosis}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Printer className="h-4 w-4" />
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
