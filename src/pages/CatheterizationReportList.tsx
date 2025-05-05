
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Settings, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CatheterizationReportList = () => {
  // Sample data
  const reports = [
    {
      id: '1',
      patientName: 'Ana Clara Oliveira',
      patientId: '123456',
      date: '2025-05-05',
      doctor: 'Dr. Carlos Silva',
      status: 'Finalizado'
    },
    {
      id: '2',
      patientName: 'João Pedro Santos',
      patientId: '789012',
      date: '2025-05-04',
      doctor: 'Dr. Carlos Silva',
      status: 'Finalizado'
    },
    {
      id: '3',
      patientName: 'Maria Eduarda Lima',
      patientId: '345678',
      date: '2025-05-03',
      doctor: 'Dra. Fernanda Costa',
      status: 'Rascunho'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Cateterismo</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/catheterization/templates">
                <Settings className="mr-2 h-4 w-4" />
                Templates
              </Link>
            </Button>
            <Button asChild>
              <Link to="/catheterization/report">
                <Plus className="mr-2 h-4 w-4" />
                Novo Relatório
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="finished">Finalizados</TabsTrigger>
            <TabsTrigger value="draft">Rascunhos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Cateterismo</CardTitle>
                <CardDescription>
                  Lista de todos os relatórios de cateterismo criados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.patientName}</p>
                            <p className="text-sm text-muted-foreground">ID: {report.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(report.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{report.doctor}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === 'Finalizado' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/catheterization/report/${report.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="finished" className="pt-4">
            {/* Similar card with filtered data for finished reports */}
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Finalizados</CardTitle>
                <CardDescription>
                  Lista dos relatórios de cateterismo finalizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports
                      .filter((report) => report.status === 'Finalizado')
                      .map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{report.patientName}</p>
                              <p className="text-sm text-muted-foreground">ID: {report.patientId}</p>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(report.date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{report.doctor}</TableCell>
                          <TableCell>
                            <Badge>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/catheterization/report/${report.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="draft" className="pt-4">
            {/* Similar card with filtered data for draft reports */}
            <Card>
              <CardHeader>
                <CardTitle>Rascunhos</CardTitle>
                <CardDescription>
                  Lista dos relatórios de cateterismo em rascunho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports
                      .filter((report) => report.status === 'Rascunho')
                      .map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{report.patientName}</p>
                              <p className="text-sm text-muted-foreground">ID: {report.patientId}</p>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(report.date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{report.doctor}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/catheterization/report/${report.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
