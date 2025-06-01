
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { angioplastyService, AngioplastyRequest } from '@/services/angioplastyService';
import { useToast } from '@/hooks/use-toast';

export const AngioplastyList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [angioplasties, setAngioplasties] = useState<AngioplastyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAngioplasties();
  }, []);

  const loadAngioplasties = async () => {
    try {
      setLoading(true);
      const requests = await angioplastyService.getAllRequests();
      setAngioplasties(requests);
    } catch (error) {
      console.error('Erro ao carregar solicitações de angioplastia:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as solicitações de angioplastia.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAngioplasties = angioplasties.filter(item =>
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.insuranceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    // Como não temos status no banco ainda, vamos mostrar como "Criada" para todas
    return <Badge className="bg-blue-100 text-blue-800">Criada</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando solicitações...</span>
              </div>
            ) : (
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
                  {filteredAngioplasties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {angioplasties.length === 0 
                          ? "Nenhuma solicitação encontrada. Crie sua primeira solicitação."
                          : "Nenhuma solicitação corresponde aos critérios de busca."
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAngioplasties.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.requestNumber}</TableCell>
                        <TableCell>{item.patientName}</TableCell>
                        <TableCell>{item.insuranceName}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>{getStatusBadge()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AngioplastyList;
