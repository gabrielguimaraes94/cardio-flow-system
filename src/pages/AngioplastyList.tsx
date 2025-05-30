
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AngioplastyList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dados de exemplo - em um app real, isso viria do banco de dados
  const angioplasties = [
    {
      id: '1',
      requestNumber: 'ANP-20250530-A1B2C',
      patientName: 'João Silva',
      insuranceName: 'Unimed',
      createdAt: '30/05/2025',
      status: 'Aprovada'
    },
    {
      id: '2',
      requestNumber: 'ANP-20250528-D3E4F',
      patientName: 'Maria Oliveira',
      insuranceName: 'Bradesco Saúde',
      createdAt: '28/05/2025',
      status: 'Pendente'
    },
    {
      id: '3',
      requestNumber: 'ANP-20250525-G5H6I',
      patientName: 'Carlos Santos',
      insuranceName: 'SulAmérica',
      createdAt: '25/05/2025',
      status: 'Aprovada'
    }
  ];

  const filteredAngioplasties = angioplasties.filter(item =>
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.insuranceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return <Badge className="bg-green-100 text-green-800">Aprovada</Badge>;
      case 'Pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'Rejeitada':
        return <Badge className="bg-red-100 text-red-800">Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Lista de Solicitações</h1>
            <p className="text-gray-500">Visualize e gerencie todas as solicitações de angioplastia</p>
          </div>
          <Button asChild>
            <Link to="/angioplasty/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova Solicitação
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Angioplastia</CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, número da solicitação ou convênio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número da Solicitação</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Convênio</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAngioplasties.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.requestNumber}</TableCell>
                    <TableCell>{item.patientName}</TableCell>
                    <TableCell>{item.insuranceName}</TableCell>
                    <TableCell>{item.createdAt}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AngioplastyList;
