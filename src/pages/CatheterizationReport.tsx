import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, FileText, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Template, TemplateNode } from './CatheterizationTemplateEditor';
import { toast } from 'sonner';

export const CatheterizationReport = () => {
  const { id } = useParams();
  const isEditing = !!id;
  
  // Sample data
  const templates = [
    {
      id: '1',
      name: 'Template Padrão',
      author: 'Dr. Carlos Silva',
      shared: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: [
        // ... same structure as in the editor
      ]
    },
    {
      id: '2',
      name: 'Template Personalizado',
      author: 'Dr. Carlos Silva',
      shared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: []
    }
  ];

  const [patientName, setPatientName] = useState('Ana Clara Oliveira');
  const [patientId, setPatientId] = useState('123456');
  const [procedureDate, setProcedureDate] = useState('2025-05-05');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [reportText, setReportText] = useState(`
Cateterismo Cardíaco

Paciente: Ana Clara Oliveira
Data: 05/05/2025
Médico responsável: Dr. Carlos Silva

Coronárias:
- Coronária Direita (CD): Moderado
  Apresenta lesões Moderadas, de característica Focal, localizada em segmento Proximal,
  com estenose de aproximadamente 70%.
  
- Descendente Anterior (DA): Importante
  Apresenta lesões Graves, de característica Difusa, localizada em segmento Médio,
  com estenose de aproximadamente 85%.
  
- Circunflexa (CX): Pequeno
  Sem lesões significativas.
  
Conclusão:
Paciente apresenta doença aterosclerótica coronariana bi-arterial, acometendo CD e DA,
com lesões significativas que necessitam de intervenção.

Sugere-se angioplastia coronariana com implante de stent farmacológico.
`);

  const handleSaveReport = () => {
    toast.success('Relatório de cateterismo salvo com sucesso!');
  };

  const handleExportPDF = () => {
    toast.success('Relatório exportado como PDF');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Relatório de Cateterismo' : 'Novo Relatório de Cateterismo'}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button onClick={handleSaveReport}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Relatório
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Nome do Paciente</Label>
                  <Input 
                    id="patient-name" 
                    value={patientName} 
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patient-id">Identificação</Label>
                  <Input 
                    id="patient-id" 
                    value={patientId} 
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="procedure-date">Data do Procedimento</Label>
                  <Input 
                    id="procedure-date" 
                    type="date" 
                    value={procedureDate} 
                    onChange={(e) => setProcedureDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedTemplate}
                  onValueChange={(value) => setSelectedTemplate(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full justify-start p-0" asChild>
                  <a href="/catheterization/template-editor">
                    <FileText className="mr-2 h-4 w-4" />
                    Gerenciar Templates
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Relatório de Cateterismo</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="form">
                  <TabsList>
                    <TabsTrigger value="form">Formulário</TabsTrigger>
                    <TabsTrigger value="text">Texto</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="form" className="space-y-4 pt-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Preencha os valores para cada artéria coronária conforme o template selecionado.
                      </p>
                      
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="font-medium">Coronária Direita (CD)</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                            <div className="space-y-2">
                              <Label htmlFor="cd-size">Tamanho</Label>
                              <Select defaultValue="Moderado">
                                <SelectTrigger id="cd-size">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pequeno">Pequeno</SelectItem>
                                  <SelectItem value="Moderado">Moderado</SelectItem>
                                  <SelectItem value="Importante">Importante</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cd-lesions">Lesões</Label>
                              <Select defaultValue="Com lesões">
                                <SelectTrigger id="cd-lesions">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Sem lesões">Sem lesões</SelectItem>
                                  <SelectItem value="Com lesões">Com lesões</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cd-type">Tipo</Label>
                              <Select defaultValue="Moderada">
                                <SelectTrigger id="cd-type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Discreta">Discreta</SelectItem>
                                  <SelectItem value="Moderada">Moderada</SelectItem>
                                  <SelectItem value="Grave">Grave</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cd-characteristic">Característica</Label>
                              <Select defaultValue="Focal">
                                <SelectTrigger id="cd-characteristic">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Focal">Focal</SelectItem>
                                  <SelectItem value="Calcificada">Calcificada</SelectItem>
                                  <SelectItem value="Difusa">Difusa</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cd-location">Localização</Label>
                              <Select defaultValue="Proximal">
                                <SelectTrigger id="cd-location">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Proximal">Proximal</SelectItem>
                                  <SelectItem value="Médio">Médio</SelectItem>
                                  <SelectItem value="Distal">Distal</SelectItem>
                                  <SelectItem value="Bifurcação">Bifurcação</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cd-stenosis">% Estenose</Label>
                              <Input id="cd-stenosis" type="number" defaultValue={70} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-medium">Descendente Anterior (DA)</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                            <div className="space-y-2">
                              <Label htmlFor="da-size">Tamanho</Label>
                              <Select defaultValue="Importante">
                                <SelectTrigger id="da-size">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pequeno">Pequeno</SelectItem>
                                  <SelectItem value="Moderado">Moderado</SelectItem>
                                  <SelectItem value="Importante">Importante</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Similar fields for DA as for CD */}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-medium">Circunflexa (CX)</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                            <div className="space-y-2">
                              <Label htmlFor="cx-size">Tamanho</Label>
                              <Select defaultValue="Pequeno">
                                <SelectTrigger id="cx-size">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pequeno">Pequeno</SelectItem>
                                  <SelectItem value="Moderado">Moderado</SelectItem>
                                  <SelectItem value="Importante">Importante</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Similar fields for CX as for CD */}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Button onClick={() => toast.success('Dados aplicados ao relatório!')}>
                          Gerar Relatório
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="text" className="space-y-4 pt-4">
                    <Textarea 
                      className="min-h-[500px] font-mono"
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Digite aqui o relatório de cateterismo..."
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
