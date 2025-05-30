
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, User, Building } from 'lucide-react';

export const AngioplastySearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    patientName: '',
    requestNumber: '',
    insurance: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });

  const handleSearch = () => {
    console.log('Searching with params:', searchParams);
    // Aqui você implementaria a lógica de busca
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Buscar Angioplastias</h1>
          <p className="text-gray-500">Encontre angioplastias específicas usando filtros avançados</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Nome do Paciente</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="patient-name"
                      placeholder="Digite o nome do paciente"
                      value={searchParams.patientName}
                      onChange={(e) => setSearchParams({...searchParams, patientName: e.target.value})}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-number">Número da Solicitação</Label>
                  <Input
                    id="request-number"
                    placeholder="ANP-YYYYMMDD-XXXXX"
                    value={searchParams.requestNumber}
                    onChange={(e) => setSearchParams({...searchParams, requestNumber: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance">Convênio</Label>
                  <div className="relative">
                    <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="insurance"
                      placeholder="Nome do convênio"
                      value={searchParams.insurance}
                      onChange={(e) => setSearchParams({...searchParams, insurance: e.target.value})}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-from">Data Inicial</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date-from"
                      type="date"
                      value={searchParams.dateFrom}
                      onChange={(e) => setSearchParams({...searchParams, dateFrom: e.target.value})}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-to">Data Final</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date-to"
                      type="date"
                      value={searchParams.dateTo}
                      onChange={(e) => setSearchParams({...searchParams, dateTo: e.target.value})}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={searchParams.status} onValueChange={(value) => setSearchParams({...searchParams, status: value})}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSearch} className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Resultados da Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>Use os filtros ao lado para buscar angioplastias</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AngioplastySearch;
