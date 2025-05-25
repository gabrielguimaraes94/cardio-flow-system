
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Settings, Eye, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Catheterization: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Cateterismo Cardíaco</h1>
            <p className="text-gray-500">Gerencie relatórios e templates de cateterismo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-cardio-500" />
                Novo Relatório
              </CardTitle>
              <CardDescription>
                Criar um novo relatório de cateterismo cardíaco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/catheterization/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Relatório
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Lista de Relatórios
              </CardTitle>
              <CardDescription>
                Visualizar todos os relatórios de cateterismo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/catheterization/list">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Relatórios
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Templates
              </CardTitle>
              <CardDescription>
                Gerenciar templates de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/catheterization/template-editor">
                  <Settings className="mr-2 h-4 w-4" />
                  Gerenciar Templates
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
                  <span className="text-sm text-gray-600">Relatórios este mês</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Relatórios finalizados</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rascunhos</span>
                  <span className="font-semibold">4</span>
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

export default Catheterization;
