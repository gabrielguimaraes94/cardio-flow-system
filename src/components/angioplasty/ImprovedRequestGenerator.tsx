
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  ChevronDown, 
  Printer, 
  FileText, 
  Search,
  Filter 
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from "zod";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { usePatients } from '@/hooks/usePatients';
import { useClinic } from '@/contexts/ClinicContext';

interface TussCode {
  id: string;
  code: string;
  description: string;
  justifications: string[];
  referenceValue: number;
}

interface Material {
  id: string;
  description: string;
  manufacturer: string;
  code: string;
  compatibleProcedures: string[];
  referencePrice: number;
}

interface MaterialWithQuantity extends Material {
  quantity: number;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  logo?: string;
}

interface InsuranceCompany {
  id: string;
  name: string;
  requiresDigitalSubmission: boolean;
}

interface Patient {
  id: string;
  name: string;
  birthdate: string;
  cpf: string;
  phone: string | null;
  email: string | null;
  age?: number;
}

export const ImprovedRequestGenerator = () => {
  const [selectedProcedures, setSelectedProcedures] = useState<TussCode[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialWithQuantity[]>([]);
  const [justification, setJustification] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<string | undefined>();
  const [selectedInsurance, setSelectedInsurance] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>();
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  
  const { selectedClinic: contextClinic } = useClinic();
  const { patients, isLoading: patientsLoading, setSearchTerm: setPatientListSearchTerm } = usePatients();
  
  // Quando o componente é montado, define a clínica selecionada do contexto
  useEffect(() => {
    if (contextClinic) {
      setSelectedClinic(contextClinic.id);
    }
  }, [contextClinic]);
  
  // Atualiza a busca de pacientes quando o termo de pesquisa muda
  useEffect(() => {
    setPatientListSearchTerm(patientSearchTerm);
  }, [patientSearchTerm, setPatientListSearchTerm]);

  // Mock data - would come from a database in a real implementation
  const tussCodes: TussCode[] = [
    {
      id: '1',
      code: '30912016',
      description: 'Angioplastia transluminal percutânea',
      justifications: ['Estenose crítica', 'Obstrução parcial', 'Reserva fracionada de fluxo alterada'],
      referenceValue: 4500.00
    },
    {
      id: '2',
      code: '30912083',
      description: 'Implante de stent coronário',
      justifications: ['Estenose crítica', 'Oclusão total', 'Dissecção coronária'],
      referenceValue: 6800.00
    },
    {
      id: '3',
      code: '30912091',
      description: 'Valvoplastia mitral percutânea',
      justifications: ['Estenose mitral severa', 'Sintomas classe II-IV NYHA'],
      referenceValue: 7200.00
    },
    {
      id: '4',
      code: '30912105',
      description: 'Oclusão de comunicação interatrial',
      justifications: ['CIA tipo ostium secundum', 'Shunt significativo'],
      referenceValue: 8500.00
    }
  ];
  
  const materials: Material[] = [
    {
      id: '1',
      description: 'Stent Farmacológico',
      manufacturer: 'Boston Scientific',
      code: 'STE-001',
      compatibleProcedures: ['2'],
      referencePrice: 5200.00
    },
    {
      id: '2',
      description: 'Cateter Balão',
      manufacturer: 'Medtronic',
      code: 'CAT-002',
      compatibleProcedures: ['1', '2'],
      referencePrice: 1800.00
    },
    {
      id: '3',
      description: 'Introdutor Arterial',
      manufacturer: 'Cordis',
      code: 'INT-003',
      compatibleProcedures: ['1', '2', '3', '4'],
      referencePrice: 350.00
    },
    {
      id: '4',
      description: 'Guia Hidrofílica',
      manufacturer: 'Terumo',
      code: 'GUI-004',
      compatibleProcedures: ['1', '2', '3'],
      referencePrice: 450.00
    },
    {
      id: '5',
      description: 'Dispositivo de Oclusão Amplatzer',
      manufacturer: 'Abbott',
      code: 'AMP-005',
      compatibleProcedures: ['4'],
      referencePrice: 12000.00
    }
  ];
  
  const clinics: Clinic[] = contextClinic ? [
    {
      id: contextClinic.id,
      name: contextClinic.name,
      address: contextClinic.address || '',
      phone: contextClinic.phone || '',
      logo: contextClinic.logo_url,
    }
  ] : [];
  
  const insuranceCompanies: InsuranceCompany[] = [
    { id: '1', name: 'Bradesco Saúde', requiresDigitalSubmission: true },
    { id: '2', name: 'Amil', requiresDigitalSubmission: true },
    { id: '3', name: 'Unimed', requiresDigitalSubmission: false },
    { id: '4', name: 'SulAmérica', requiresDigitalSubmission: true }
  ];
  
  const justificationTemplates = [
    'Paciente com quadro de dor torácica em repouso, apresentando lesão coronariana crítica na artéria descendente anterior, com indicação de revascularização percutânea.',
    'Paciente com diagnóstico de síndrome coronariana aguda sem supra de ST, apresentando lesão crítica em artéria coronária direita, com indicação de tratamento percutâneo.',
    'Paciente com angina estável, apresentando teste de isquemia positivo, com lesão significativa em tronco de coronária esquerda.'
  ];
  
  const handleToggleProcedure = (tuss: TussCode) => {
    setSelectedProcedures(prev => {
      const isSelected = prev.some(p => p.id === tuss.id);
      
      if (isSelected) {
        const newProcedures = prev.filter(p => p.id !== tuss.id);
        // Remove materials that are only compatible with this procedure
        setSelectedMaterials(prevMaterials => 
          prevMaterials.filter(m => 
            m.compatibleProcedures.some(procId => 
              newProcedures.some(p => p.id === procId)
            )
          )
        );
        return newProcedures;
      } else {
        return [...prev, tuss];
      }
    });
  };
  
  const handleToggleMaterial = (material: Material) => {
    setSelectedMaterials(prev => {
      const isSelected = prev.some(m => m.id === material.id);
      
      if (isSelected) {
        return prev.filter(m => m.id !== material.id);
      } else {
        return [...prev, { ...material, quantity: 1 }];
      }
    });
  };
  
  const handleMaterialQuantityChange = (materialId: string, quantity: number) => {
    if (quantity < 1) return; // Não permite quantidade menor que 1
    
    setSelectedMaterials(prev => 
      prev.map(m => m.id === materialId ? { ...m, quantity } : m)
    );
  };
  
  const handleApplyTemplate = (template: string) => {
    setJustification(template);
  };
  
  const calculateTotal = () => {
    const proceduresTotal = selectedProcedures.reduce((sum, proc) => sum + proc.referenceValue, 0);
    const materialsTotal = selectedMaterials.reduce((sum, mat) => sum + (mat.referencePrice * mat.quantity), 0);
    return proceduresTotal + materialsTotal;
  };
  
  const handleGenerateRequest = () => {
    if (!selectedClinic) {
      toast.error('Selecione uma clínica');
      return;
    }
    
    if (!selectedInsurance) {
      toast.error('Selecione um convênio');
      return;
    }
    
    if (!selectedPatient) {
      toast.error('Selecione um paciente');
      return;
    }
    
    if (selectedProcedures.length === 0) {
      toast.error('Selecione pelo menos um procedimento');
      return;
    }
    
    if (!justification) {
      toast.error('Adicione uma justificativa médica');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Solicitação de angioplastia gerada com sucesso!');
    }, 1500);
  };
  
  const handleDigitalSubmission = () => {
    const insurance = insuranceCompanies.find(i => i.id === selectedInsurance);
    
    if (!insurance) {
      toast.error('Selecione um convênio');
      return;
    }
    
    if (!insurance.requiresDigitalSubmission) {
      toast.error('Este convênio não suporta envio eletrônico');
      return;
    }
    
    toast.success('Solicitação enviada eletronicamente para ' + insurance.name);
  };
  
  const isMaterialCompatible = (material: Material) => {
    if (selectedProcedures.length === 0) return true;
    
    return selectedProcedures.some(proc => 
      material.compatibleProcedures.includes(proc.id)
    );
  };
  
  const filteredProcedures = tussCodes.filter(proc => 
    proc.description.toLowerCase().includes(procedureSearchTerm.toLowerCase()) || 
    proc.code.includes(procedureSearchTerm)
  );
  
  const filteredMaterials = materials.filter(mat => 
    (mat.description.toLowerCase().includes(materialSearchTerm.toLowerCase()) || 
    mat.manufacturer.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    mat.code.toLowerCase().includes(materialSearchTerm.toLowerCase()))
  );
  
  const getSelectedPatientName = () => {
    if (!selectedPatient) return '';
    const patient = patients.find(p => p.id === selectedPatient);
    return patient ? patient.name : '';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna da esquerda com seleção de paciente/clínica/convênio */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-select" className="font-medium">Paciente</Label>
                <div className="relative w-full">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedPatient ? getSelectedPatientName() : "Selecionar Paciente"}
                        <Search className="h-4 w-4 opacity-50" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Selecionar Paciente</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="Buscar pacientes por nome, CPF..." 
                            className="pl-9"
                            value={patientSearchTerm}
                            onChange={(e) => setPatientSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        <div className="border rounded-md overflow-hidden min-h-[250px] max-h-[350px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>CPF</TableHead>
                                <TableHead>Idade</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {patientsLoading ? (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                                    Carregando pacientes...
                                  </TableCell>
                                </TableRow>
                              ) : patients.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                                    Nenhum paciente encontrado
                                  </TableCell>
                                </TableRow>
                              ) : (
                                patients.map((patient) => (
                                  <TableRow 
                                    key={patient.id} 
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedPatient(patient.id);
                                      setPatientSearchTerm('');
                                    }}
                                  >
                                    <TableCell>{patient.name}</TableCell>
                                    <TableCell>{patient.cpf}</TableCell>
                                    <TableCell>{patient.age || '-'}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinic">Clínica/Consultório</Label>
                <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                  <SelectTrigger id="clinic">
                    <SelectValue placeholder="Selecione uma clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map(clinic => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insurance">Convênio</Label>
                <Select value={selectedInsurance} onValueChange={setSelectedInsurance}>
                  <SelectTrigger id="insurance">
                    <SelectValue placeholder="Selecione um convênio" />
                  </SelectTrigger>
                  <SelectContent>
                    {insuranceCompanies.map(insurance => (
                      <SelectItem key={insurance.id} value={insurance.id}>
                        {insurance.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="font-medium">Justificativa Médica</Label>
                <Textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Adicione aqui a justificativa médica para os procedimentos..."
                  rows={6}
                  className="resize-none"
                />
                
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full flex justify-between">
                      <span>Templates de justificativas</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="border rounded-md p-3 space-y-2">
                      {justificationTemplates.map((template, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-start">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleApplyTemplate(template)}
                              className="h-6 p-0 mr-2"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <div className="text-xs">{template}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna da direita com tabs para procedimentos e materiais */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="procedures" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
              <TabsTrigger value="materials">Materiais</TabsTrigger>
            </TabsList>
            
            {/* Tab de Procedimentos */}
            <TabsContent value="procedures" className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar procedimentos..."
                    className="pl-9"
                    value={procedureSearchTerm}
                    onChange={(e) => setProcedureSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcedures.length > 0 ? (
                      filteredProcedures.map((proc) => (
                        <TableRow key={proc.id}>
                          <TableCell className="text-center">
                            <Checkbox 
                              checked={selectedProcedures.some(p => p.id === proc.id)}
                              onCheckedChange={() => handleToggleProcedure(proc)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{proc.code}</TableCell>
                          <TableCell>{proc.description}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                          Nenhum procedimento encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Tab de Materiais */}
            <TabsContent value="materials" className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar materiais..."
                    className="pl-9"
                    value={materialSearchTerm}
                    onChange={(e) => setMaterialSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Qtd</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.length > 0 ? (
                      filteredMaterials.map((mat) => {
                        const isCompatible = isMaterialCompatible(mat);
                        const isSelected = selectedMaterials.some(m => m.id === mat.id);
                        const selectedMat = selectedMaterials.find(m => m.id === mat.id);
                        
                        return (
                          <TableRow 
                            key={mat.id} 
                            className={!isCompatible ? "opacity-50" : ""}
                          >
                            <TableCell className="text-center">
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => handleToggleMaterial(mat)}
                                disabled={!isCompatible}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{mat.description}</p>
                                <p className="text-xs text-gray-500">{mat.code}</p>
                              </div>
                            </TableCell>
                            <TableCell>{mat.manufacturer}</TableCell>
                            <TableCell>
                              {isSelected && (
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => handleMaterialQuantityChange(
                                      mat.id, 
                                      Math.max(1, (selectedMat?.quantity || 1) - 1)
                                    )}
                                  >
                                    -
                                  </Button>
                                  <span className="w-6 text-center">
                                    {selectedMat?.quantity || 1}
                                  </span>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => handleMaterialQuantityChange(
                                      mat.id, 
                                      (selectedMat?.quantity || 1) + 1
                                    )}
                                  >
                                    +
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          Nenhum material encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          {/* Sumário da Solicitação */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-medium">Resumo da Solicitação</h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="procedures">
                  <AccordionTrigger className="py-2">
                    Procedimentos Selecionados ({selectedProcedures.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    {selectedProcedures.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">Nenhum procedimento selecionado</p>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código</TableHead>
                              <TableHead>Descrição</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedProcedures.map(proc => (
                              <TableRow key={proc.id}>
                                <TableCell className="text-xs">{proc.code}</TableCell>
                                <TableCell className="text-xs">{proc.description}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="materials">
                  <AccordionTrigger className="py-2">
                    Materiais Selecionados ({selectedMaterials.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    {selectedMaterials.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">Nenhum material selecionado</p>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Descrição</TableHead>
                              <TableHead className="text-center">Qtd.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedMaterials.map(mat => (
                              <TableRow key={mat.id}>
                                <TableCell className="text-xs">
                                  {mat.description} ({mat.manufacturer})
                                </TableCell>
                                <TableCell className="text-xs text-center">{mat.quantity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="flex justify-end mt-6 space-x-3">
                {selectedInsurance && insuranceCompanies.find(i => i.id === selectedInsurance)?.requiresDigitalSubmission && (
                  <Button 
                    variant="outline" 
                    onClick={handleDigitalSubmission}
                    disabled={isGenerating}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Envio Eletrônico
                  </Button>
                )}
                
                <Button 
                  onClick={handleGenerateRequest}
                  disabled={isGenerating}
                  className="bg-cardio-500 hover:bg-cardio-600"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Gerando...' : 'Gerar PDF'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
