
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Settings, Eye, BarChart3, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Angioplasty: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Angioplastia</h1>
            <p className="text-gray-500">Gerencie solicitações e relatórios de angioplastia</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-cardio-500" />
                Nova Solicitação
              </CardTitle>
              <CardDescription>
                Criar uma nova solicitação de angioplastia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/angioplasty/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Solicitação
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Lista de Solicitações
              </CardTitle>
              <CardDescription>
                Visualizar todas as solicitações de angioplastia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/angioplasty/list">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Solicitações
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-500" />
                Buscar Angioplastias
              </CardTitle>
              <CardDescription>
                Pesquisar angioplastias por paciente ou data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/angioplasty/search">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Estatísticas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Solicitações este mês</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Solicitações aprovadas</span>
                  <span className="font-semibold">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Aguardando aprovação</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de aprovação</span>
                  <span className="font-semibold text-green-600">75%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link to="/reports">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Relatórios Gerais
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link to="/patients">
                  <Eye className="mr-2 h-4 w-4" />
                  Buscar Pacientes
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Angioplasty;
