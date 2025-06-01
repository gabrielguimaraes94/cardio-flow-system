
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { angioplastyService, AngioplastyRequest, AngioplastyStatus } from '@/services/angioplastyService';
import { useToast } from '@/hooks/use-toast';
import { AngioplastyRequestActions } from '@/components/angioplasty/AngioplastyRequestActions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const AngioplastyList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [angioplasties, setAngioplasties] = useState<AngioplastyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AngioplastyStatus | 'all'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadAngioplasties();
  }, [statusFilter]);

  const loadAngioplasties = async () => {
    try {
      setLoading(true);
      const filterStatus = statusFilter === 'all' ? undefined : statusFilter;
      const requests = await angioplastyService.getAllRequests(filterStatus);
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

  const getStatusBadge = (status: AngioplastyStatus) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusFilterLabel = (status: AngioplastyStatus | 'all') => {
    switch (status) {
      case 'active':
        return 'Ativas';
      case 'cancelled':
        return 'Canceladas';
      default:
        return 'Todas';
    }
  };

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Lista de Solicitações</h1>
            <p className="text-gray-500 text-sm md:text-base">
              Visualize e gerencie todas as solicitações de angioplastia
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/angioplasty/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova Solicitação
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Solicitações de Angioplastia</CardTitle>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, número da solicitação ou convênio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    {getStatusFilterLabel(statusFilter)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    Todas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Ativas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                    Canceladas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando solicitações...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Número da Solicitação</TableHead>
                      <TableHead className="min-w-[120px]">Paciente</TableHead>
                      <TableHead className="min-w-[120px]">Convênio</TableHead>
                      <TableHead className="min-w-[100px]">Data</TableHead>
                      <TableHead className="min-w-[90px]">Status</TableHead>
                      <TableHead className="w-[60px]">Ações</TableHead>
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
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <AngioplastyRequestActions 
                              request={item} 
                              onRequestUpdated={loadAngioplasties}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AngioplastyList;
