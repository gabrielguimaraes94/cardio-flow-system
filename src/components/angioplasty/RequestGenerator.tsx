
import React, { useState } from 'react';
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
import { Plus, ChevronDown, Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';

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

export const RequestGenerator = () => {
  const [selectedProcedures, setSelectedProcedures] = useState<TussCode[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialWithQuantity[]>([]);
  const [justification, setJustification] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<string | undefined>();
  const [selectedInsurance, setSelectedInsurance] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  
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
    }
  ];
  
  const clinics: Clinic[] = [
    {
      id: '1',
      name: 'Cardio Center',
      address: 'Av. Paulista, 1000, São Paulo, SP',
      phone: '(11) 3333-4444',
    },
    {
      id: '2',
      name: 'Instituto Cardiovascular',
      address: 'Rua da Consolação, 500, São Paulo, SP',
      phone: '(11) 5555-6666',
    }
  ];
  
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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Gerador de Solicitações de Angioplastia</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">Procedimentos</h3>
            <div className="border rounded-md p-3 space-y-2">
              {tussCodes.map(tuss => (
                <div key={tuss.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`proc-${tuss.id}`}
                    checked={selectedProcedures.some(p => p.id === tuss.id)}
                    onCheckedChange={() => handleToggleProcedure(tuss)}
                  />
                  <label 
                    htmlFor={`proc-${tuss.id}`} 
                    className="text-sm leading-tight"
                  >
                    <div className="font-medium">{tuss.description}</div>
                    <div className="text-muted-foreground text-xs">
                      TUSS: {tuss.code} - R$ {tuss.referenceValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">Materiais</h3>
            <div className="border rounded-md p-3 space-y-2">
              {materials.map(material => (
                <div key={material.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`mat-${material.id}`}
                    checked={selectedMaterials.some(m => m.id === material.id)}
                    onCheckedChange={() => handleToggleMaterial(material)}
                    disabled={!isMaterialCompatible(material)}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`mat-${material.id}`} 
                      className={`text-sm leading-tight ${!isMaterialCompatible(material) ? 'text-muted-foreground' : ''}`}
                    >
                      <div className="font-medium">{material.description}</div>
                      <div className="text-muted-foreground text-xs">
                        {material.manufacturer} - {material.code} - R$ {material.referencePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </div>
                    </label>
                    
                    {selectedMaterials.some(m => m.id === material.id) && (
                      <div className="flex items-center mt-1">
                        <Label htmlFor={`qty-${material.id}`} className="text-xs mr-2">
                          Quantidade:
                        </Label>
                        <Input
                          id={`qty-${material.id}`}
                          type="number"
                          min="1"
                          value={selectedMaterials.find(m => m.id === material.id)?.quantity || 1}
                          onChange={(e) => handleMaterialQuantityChange(material.id, parseInt(e.target.value))}
                          className="h-7 w-16 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">Justificativa Médica</h3>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Adicione aqui a justificativa médica para os procedimentos..."
              rows={6}
            />
            
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between">
                  <span>Usar templates de justificativas</span>
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
          
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">Resumo</h3>
            <div className="border rounded-md p-3 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Procedimentos Selecionados</h4>
                {selectedProcedures.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum procedimento selecionado</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProcedures.map(proc => (
                        <TableRow key={proc.id}>
                          <TableCell className="text-xs">{proc.code}</TableCell>
                          <TableCell className="text-xs">{proc.description}</TableCell>
                          <TableCell className="text-xs text-right">
                            R$ {proc.referenceValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Materiais Selecionados</h4>
                {selectedMaterials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum material selecionado</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-center">Qtd.</TableHead>
                        <TableHead className="text-right">Valor Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMaterials.map(mat => (
                        <TableRow key={mat.id}>
                          <TableCell className="text-xs">{mat.description}</TableCell>
                          <TableCell className="text-xs text-center">{mat.quantity}</TableCell>
                          <TableCell className="text-xs text-right">
                            R$ {mat.referencePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">
                            R$ {(mat.referencePrice * mat.quantity).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              
              <div className="flex justify-between items-center py-2 border-t">
                <span className="font-medium">Valor Total Estimado:</span>
                <span className="font-medium">
                  R$ {calculateTotal().toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
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
            >
              <Printer className="mr-2 h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Gerar PDF'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
