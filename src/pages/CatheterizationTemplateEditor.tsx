import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Copy, Save, Trash2, Share2 } from 'lucide-react';
import { ArterialTree } from '@/components/catheterization/ArterialTree';
import { SimplifiedArterialTree } from '@/components/catheterization/SimplifiedArterialTree';
import { TemplateSelector } from '@/components/catheterization/TemplateSelector';
import { toast } from 'sonner';

export interface TemplateNode {
  id: string;
  name: string;
  options?: string[];
  children?: TemplateNode[];
  type: 'text' | 'select' | 'number' | 'radio';
  defaultValue?: string | number;
}

export interface Template {
  id: string;
  name: string;
  author: string;
  shared: boolean;
  createdAt: Date;
  updatedAt: Date;
  structure: TemplateNode[];
}

export const CatheterizationTemplateEditor: React.FC = () => {
  // Sample initial data
  const initialTemplates: Template[] = [
    {
      id: '1',
      name: 'Template Padrão',
      author: 'Dr. Carlos Silva',
      shared: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: [
        {
          id: 'cd',
          name: 'Coronária Direita (CD)',
          type: 'select',
          options: ['Pequeno', 'Moderado', 'Importante'],
          children: [
            {
              id: 'cd_lesoes',
              name: 'Lesões',
              type: 'radio',
              options: ['Sem lesões', 'Com lesões'],
              defaultValue: 'Sem lesões',
              children: [
                {
                  id: 'cd_tipo',
                  name: 'Tipo',
                  type: 'select',
                  options: ['Discreta', 'Moderada', 'Grave'],
                },
                {
                  id: 'cd_caracteristica',
                  name: 'Característica',
                  type: 'select',
                  options: ['Focal', 'Calcificada', 'Difusa'],
                },
                {
                  id: 'cd_localizacao',
                  name: 'Localização',
                  type: 'select',
                  options: ['Proximal', 'Médio', 'Distal', 'Bifurcação'],
                },
                {
                  id: 'cd_estenose',
                  name: 'Percentual de estenose',
                  type: 'number',
                  defaultValue: 0,
                }
              ]
            }
          ]
        },
        {
          id: 'da',
          name: 'Descendente Anterior (DA)',
          type: 'select',
          options: ['Pequeno', 'Moderado', 'Importante'],
          children: [
            {
              id: 'da_lesoes',
              name: 'Lesões',
              type: 'radio',
              options: ['Sem lesões', 'Com lesões'],
              defaultValue: 'Sem lesões',
              children: [
                {
                  id: 'da_tipo',
                  name: 'Tipo',
                  type: 'select',
                  options: ['Discreta', 'Moderada', 'Grave'],
                },
                {
                  id: 'da_caracteristica',
                  name: 'Característica',
                  type: 'select',
                  options: ['Focal', 'Calcificada', 'Difusa'],
                },
                {
                  id: 'da_localizacao',
                  name: 'Localização',
                  type: 'select',
                  options: ['Proximal', 'Médio', 'Distal', 'Bifurcação'],
                },
                {
                  id: 'da_estenose',
                  name: 'Percentual de estenose',
                  type: 'number',
                  defaultValue: 0,
                }
              ]
            }
          ]
        },
        {
          id: 'cx',
          name: 'Circunflexa (CX)',
          type: 'select',
          options: ['Pequeno', 'Moderado', 'Importante'],
          children: [
            {
              id: 'cx_lesoes',
              name: 'Lesões',
              type: 'radio',
              options: ['Sem lesões', 'Com lesões'],
              defaultValue: 'Sem lesões',
              children: [
                {
                  id: 'cx_tipo',
                  name: 'Tipo',
                  type: 'select',
                  options: ['Discreta', 'Moderada', 'Grave'],
                },
                {
                  id: 'cx_caracteristica',
                  name: 'Característica',
                  type: 'select',
                  options: ['Focal', 'Calcificada', 'Difusa'],
                },
                {
                  id: 'cx_localizacao',
                  name: 'Localização',
                  type: 'select',
                  options: ['Proximal', 'Médio', 'Distal', 'Bifurcação'],
                },
                {
                  id: 'cx_estenose',
                  name: 'Percentual de estenose',
                  type: 'number',
                  defaultValue: 0,
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [currentTemplate, setCurrentTemplate] = useState<Template>(templates[0]);
  const [templateName, setTemplateName] = useState(currentTemplate.name);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [editorMode, setEditorMode] = useState<'advanced' | 'simplified'>('simplified');

  const handleSaveTemplate = () => {
    const updatedTemplate = {
      ...currentTemplate,
      name: templateName,
      updatedAt: new Date()
    };
    
    setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    setCurrentTemplate(updatedTemplate);
    toast.success('Template salvo com sucesso!');
  };

  const handleShareTemplate = () => {
    const updatedTemplate = {
      ...currentTemplate,
      shared: !currentTemplate.shared
    };
    
    setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    setCurrentTemplate(updatedTemplate);
    
    if (updatedTemplate.shared) {
      toast.success('Template compartilhado com a clínica');
    } else {
      toast.success('Template definido como privado');
    }
  };

  const handleCopyTemplate = () => {
    const newTemplate = {
      ...currentTemplate,
      id: `${Date.now()}`,
      name: `${currentTemplate.name} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      shared: false
    };
    
    setTemplates([...templates, newTemplate]);
    setCurrentTemplate(newTemplate);
    setTemplateName(newTemplate.name);
    toast.success('Template copiado com sucesso!');
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentTemplate(template);
      setTemplateName(template.name);
      setGeneratedText('');
    }
  };

  const handleDeleteTemplate = () => {
    if (templates.length <= 1) {
      toast.error('Não é possível excluir o único template disponível');
      return;
    }
    
    const newTemplates = templates.filter(t => t.id !== currentTemplate.id);
    setTemplates(newTemplates);
    setCurrentTemplate(newTemplates[0]);
    setTemplateName(newTemplates[0].name);
    toast.success('Template excluído com sucesso!');
  };

  const handleCreateTemplate = () => {
    const newTemplate: Template = {
      id: `${Date.now()}`,
      name: 'Novo Template',
      author: 'Dr. Carlos Silva',
      shared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: []
    };
    
    setTemplates([...templates, newTemplate]);
    setCurrentTemplate(newTemplate);
    setTemplateName(newTemplate.name);
    toast.success('Novo template criado!');
  };
  
  const handleStructureChange = (newStructure: TemplateNode[]) => {
    setCurrentTemplate({
      ...currentTemplate,
      structure: newStructure
    });
  };
  
  const generateReportText = () => {
    // This is a simple implementation. A more sophisticated version would 
    // traverse the structure and generate text based on selected values.
    const text = `
Cateterismo Cardíaco

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
`;
    setGeneratedText(text);
    toast.success('Texto gerado com base no template!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Editor de Templates de Cateterismo</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCreateTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Template
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Meus Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <TemplateSelector 
                  templates={templates}
                  currentTemplateId={currentTemplate.id}
                  onSelect={handleTemplateChange}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Input 
                    value={templateName} 
                    onChange={(e) => setTemplateName(e.target.value)} 
                    className="text-xl font-bold h-10"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopyTemplate}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </Button>
                    <Button 
                      variant={currentTemplate.shared ? "secondary" : "outline"}
                      onClick={handleShareTemplate}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {currentTemplate.shared ? 'Compartilhado' : 'Compartilhar'}
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteTemplate}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                    <Button onClick={handleSaveTemplate}>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="editor">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="editor">Editor de Estrutura</TabsTrigger>
                      <TabsTrigger value="preview">Visualização de Texto</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant={editorMode === 'simplified' ? 'secondary' : 'outline'} 
                        size="sm"
                        onClick={() => setEditorMode('simplified')}
                      >
                        Modo Simplificado
                      </Button>
                      <Button 
                        variant={editorMode === 'advanced' ? 'secondary' : 'outline'} 
                        size="sm"
                        onClick={() => setEditorMode('advanced')}
                      >
                        Modo Avançado
                      </Button>
                    </div>
                  </div>
                  
                  <TabsContent value="editor" className="space-y-4">
                    {editorMode === 'advanced' ? (
                      <ArterialTree 
                        structure={currentTemplate.structure}
                        onChange={handleStructureChange}
                      />
                    ) : (
                      <SimplifiedArterialTree
                        structure={currentTemplate.structure}
                        onChange={handleStructureChange}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="preview">
                    <div className="space-y-4">
                      <Button onClick={generateReportText}>
                        Gerar Texto do Relatório
                      </Button>
                      
                      {generatedText && (
                        <div className="border rounded-md p-4 whitespace-pre-wrap">
                          {generatedText}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t p-4 text-sm text-muted-foreground">
                <div className="flex justify-between w-full">
                  <span>Criado em: {currentTemplate.createdAt.toLocaleDateString()}</span>
                  <span>Última modificação: {currentTemplate.updatedAt.toLocaleDateString()}</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
