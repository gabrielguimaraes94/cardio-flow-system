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
import { Plus, ChevronDown, Printer, FileText, Search, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/contexts/ClinicContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { z } from 'zod';
import { PDFViewer } from '@/components/angioplasty/PDFViewer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Validation schemas - Melhorando os esquemas para garantir validações adequadas
const patientSchema = z.object({
  id: z.string().min(1, "ID do paciente é obrigatório"),
  name: z.string().min(1, "Nome do paciente é obrigatório"),
  birthdate: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Data de nascimento inválida",
  }),
});

const insuranceSchema = z.object({
  id: z.string().min(1, "ID do convênio é obrigatório"),
  name: z.string().min(1, "Nome do convênio é obrigatório"),
});

const doctorSchema = z.object({
  id: z.string().min(1, "ID do médico é obrigatório"),
  name: z.string().min(1, "Nome do médico é obrigatório"),
  crm: z.string().min(1, "CRM é obrigatório"),
});

const tussProcedureSchema = z.object({
  id: z.string().min(1, "ID do procedimento é obrigatório"),
  code: z.string().min(1, "Código TUSS é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

const materialSchema = z.object({
  id: z.string().min(1, "ID do material é obrigatório"),
  description: z.string().min(1, "Descrição do material é obrigatória"),
  quantity: z.number().min(1, "Quantidade deve ser pelo menos 1"),
});

const requestFormSchema = z.object({
  patient: patientSchema,
  insurance: insuranceSchema,
  coronaryAngiography: z.string().min(1, "Informações de coronariografia são obrigatórias"),
  proposedTreatment: z.string().min(1, "Tratamento proposto é obrigatório"),
  tussProcedures: z.array(tussProcedureSchema).min(1, "Selecione pelo menos um procedimento"),
  materials: z.array(materialSchema),
  surgicalTeam: z.object({
    surgeon: doctorSchema,
    assistant: doctorSchema.nullable().optional(),
    anesthesiologist: doctorSchema.nullable().optional(),
  }),
  clinic: z.object({
    id: z.string().min(1, "ID da clínica é obrigatório"),
    name: z.string().min(1, "Nome da clínica é obrigatório"),
  }),
});

// Definindo interfaces
interface Doctor {
  id: string;
  name: string;
  crm: string;
}

interface Patient {
  id: string;
  name: string;
  birthdate: string;
  gender?: string;
  email?: string;
  phone?: string;
}

interface InsuranceCompany {
  id: string;
  name: string;
  requiresDigitalSubmission: boolean;
}

interface TussCode {
  id: string;
  code: string;
  description: string;
  justifications?: string[];
}

interface Material {
  id: string;
  description: string;
  manufacturer: string;
  code: string;
  compatibleProcedures?: string[];
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
  city?: string;
  zipCode?: string;
  email?: string;
}

export const ImprovedRequestGenerator = () => {
  const { selectedClinic } = useClinic();
  const { toast } = useToast();
  
  // Form state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceCompany | null>(null);
  const [selectedTussProcedures, setSelectedTussProcedures] = useState<TussCode[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialWithQuantity[]>([]);
  const [coronaryAngiography, setCoronaryAngiography] = useState('');
  const [proposedTreatment, setProposedTreatment] = useState('');
  const [requestNumber, setRequestNumber] = useState('');
  
  // Team members
  const [surgicalTeam, setSurgicalTeam] = useState({
    surgeon: null as Doctor | null,
    assistant: null as Doctor | null,
    anesthesiologist: null as Doctor | null
  });

  // UI state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [searchTuss, setSearchTuss] = useState('');
  const [searchMaterial, setSearchMaterial] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isTussModalOpen, setIsTussModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [selectedDoctorRole, setSelectedDoctorRole] = useState<'surgeon' | 'assistant' | 'anesthesiologist'>('surgeon');
  
  // Generate a request number when the component mounts
  useEffect(() => {
    // Format: ANP-YYYYMMDD-XXXX (where XXXX is a random number)
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    setRequestNumber(`ANP-${dateStr}-${randomNum}`);
  }, []);
  
  // Mock data - would come from a database in a real implementation
  // Doctors data
  const doctors: Doctor[] = [
    { id: '1', name: 'Dr. Carlos Silva', crm: '12345-SP' },
    { id: '2', name: 'Dra. Maria Santos', crm: '23456-SP' },
    { id: '3', name: 'Dr. João Oliveira', crm: '34567-SP' },
    { id: '4', name: 'Dra. Ana Sousa', crm: '45678-SP' }
  ];
  
  // Patients data
  const patients: Patient[] = [
    { id: '1', name: 'João Silva', birthdate: '1955-05-15', gender: 'Masculino', phone: '(11) 98765-4321' },
    { id: '2', name: 'Maria Oliveira', birthdate: '1960-10-20', gender: 'Feminino', phone: '(11) 91234-5678' },
    { id: '3', name: 'Pedro Santos', birthdate: '1948-03-25', gender: 'Masculino', phone: '(11) 99876-5432' },
    { id: '4', name: 'Ana Souza', birthdate: '1970-12-08', gender: 'Feminino', phone: '(11) 92345-6789' }
  ];
  
  // Tuss codes
  const tussCodes: TussCode[] = [
    {
      id: '1',
      code: '30912016',
      description: 'Angioplastia transluminal percutânea',
      justifications: ['Estenose crítica', 'Obstrução parcial', 'Reserva fracionada de fluxo alterada']
    },
    {
      id: '2',
      code: '30912083',
      description: 'Implante de stent coronário',
      justifications: ['Estenose crítica', 'Oclusão total', 'Dissecção coronária']
    },
    {
      id: '3',
      code: '30912091',
      description: 'Angioplastia de tronco de coronária esquerda',
      justifications: ['Estenose crítica de tronco', 'Lesão de tronco não protegido']
    }
  ];
  
  // Materials
  const materials: Material[] = [
    {
      id: '1',
      description: 'Stent Farmacológico',
      manufacturer: 'Boston Scientific',
      code: 'STE-001',
      compatibleProcedures: ['2']
    },
    {
      id: '2',
      description: 'Cateter Balão',
      manufacturer: 'Medtronic',
      code: 'CAT-002',
      compatibleProcedures: ['1', '2', '3']
    },
    {
      id: '3',
      description: 'Fio Guia Hidrofílico',
      manufacturer: 'Terumo',
      code: 'FG-003',
      compatibleProcedures: ['1', '2', '3']
    },
    {
      id: '4',
      description: 'Introdutor Arterial',
      manufacturer: 'Cordis',
      code: 'INT-004',
      compatibleProcedures: ['1', '2', '3']
    }
  ];
  
  // Insurance companies
  const insuranceCompanies: InsuranceCompany[] = [
    { id: '1', name: 'Bradesco Saúde', requiresDigitalSubmission: true },
    { id: '2', name: 'Amil', requiresDigitalSubmission: true },
    { id: '3', name: 'Unimed', requiresDigitalSubmission: false },
    { id: '4', name: 'SulAmérica', requiresDigitalSubmission: true }
  ];
  
  // Clinic info based on context
  const clinics = selectedClinic ? [
    {
      id: selectedClinic.id,
      name: selectedClinic.name,
      address: selectedClinic.address || '',
      phone: selectedClinic.phone || '',
      logo: selectedClinic.logo || '',
      city: selectedClinic.city || '',
      email: selectedClinic.email || '',
      zipCode: '01310-200' // Exemplo
    }
  ] : [];
  
  const filteredPatients = searchPatient
    ? patients.filter(p => 
        p.name.toLowerCase().includes(searchPatient.toLowerCase())
      )
    : patients;
    
  const filteredTussCodes = searchTuss
    ? tussCodes.filter(t => 
        t.code.includes(searchTuss) || 
        t.description.toLowerCase().includes(searchTuss.toLowerCase())
      )
    : tussCodes;
    
  const filteredMaterials = searchMaterial
    ? materials.filter(m => 
        m.description.toLowerCase().includes(searchMaterial.toLowerCase()) ||
        m.manufacturer.toLowerCase().includes(searchMaterial.toLowerCase())
      )
    : materials;
    
  const filteredDoctors = searchDoctor
    ? doctors.filter(d => 
        d.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
        d.crm.toLowerCase().includes(searchDoctor.toLowerCase())
      )
    : doctors;
  
  const handleMaterialQuantityChange = (materialId: string, quantity: number) => {
    setSelectedMaterials(prev => 
      prev.map(m => m.id === materialId ? { ...m, quantity } : m)
    );
  };
  
  const handleAddMaterial = (material: Material) => {
    if (!selectedMaterials.some(m => m.id === material.id)) {
      setSelectedMaterials([...selectedMaterials, { ...material, quantity: 1 }]);
    }
  };
  
  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
  };
  
  const handleAddTussProcedure = (tuss: TussCode) => {
    if (!selectedTussProcedures.some(t => t.id === tuss.id)) {
      setSelectedTussProcedures([...selectedTussProcedures, tuss]);
    }
  };
  
  const handleRemoveTussProcedure = (tussId: string) => {
    setSelectedTussProcedures(selectedTussProcedures.filter(t => t.id !== tussId));
  };
  
  const handleSelectDoctor = (doctor: Doctor) => {
    setSurgicalTeam({
      ...surgicalTeam,
      [selectedDoctorRole]: doctor
    });
    setIsDoctorModalOpen(false);
  };
  
  // Função melhorada para validar o formulário
  const validateForm = () => {
    try {
      // Verificar se há uma clínica selecionada
      if (!selectedClinic) {
        throw new z.ZodError([{
          code: "custom",
          message: "Nenhuma clínica selecionada",
          path: ["clinic"]
        }]);
      }

      // Verificar paciente
      if (!selectedPatient) {
        throw new z.ZodError([{
          code: "custom",
          message: "Selecione um paciente",
          path: ["patient"]
        }]);
      }

      // Verificar convênio
      if (!selectedInsurance) {
        throw new z.ZodError([{
          code: "custom",
          message: "Selecione um convênio",
          path: ["insurance"]
        }]);
      }

      // Verificar cirurgião
      if (!surgicalTeam.surgeon) {
        throw new z.ZodError([{
          code: "custom",
          message: "Selecione um cirurgião",
          path: ["surgicalTeam", "surgeon"]
        }]);
      }

      // Verificar procedimentos
      if (selectedTussProcedures.length === 0) {
        throw new z.ZodError([{
          code: "custom",
          message: "Selecione pelo menos um procedimento TUSS",
          path: ["tussProcedures"]
        }]);
      }

      // Verificar campos de texto
      if (!coronaryAngiography.trim()) {
        throw new z.ZodError([{
          code: "custom",
          message: "Preencha as informações de coronariografia",
          path: ["coronaryAngiography"]
        }]);
      }

      if (!proposedTreatment.trim()) {
        throw new z.ZodError([{
          code: "custom",
          message: "Preencha o tratamento proposto",
          path: ["proposedTreatment"]
        }]);
      }

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(err => err.message).join(", ");
        toast({
          title: "Erro de validação",
          description: errorMessage,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const handleGenerateRequest = () => {
    // Primeiro validamos o formulário antes de tentar gerar o PDF
    if (!validateForm()) {
      return;
    }

    try {
      // Se a validação passou, abra o PDF preview
      setIsPdfModalOpen(true);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      
      if (error instanceof z.ZodError) {
        // Display validation errors
        const errorMessages = error.errors.map(err => err.message).join(", ");
        toast({
          title: "Erro de validação",
          description: errorMessages,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao gerar solicitação",
          description: "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };
  
  const calculatePatientAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Clínica disponível?
  const hasClinic = Boolean(selectedClinic);
  
  return (
    <div className="space-y-8">
      {!hasClinic && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Nenhuma clínica selecionada</AlertTitle>
          <AlertDescription>
            Você precisa selecionar uma clínica antes de gerar uma solicitação de angioplastia.
            Por favor, selecione uma clínica no seletor na parte superior da página.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Patient selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Paciente</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setIsPatientModalOpen(true)}
                >
                  {selectedPatient ? selectedPatient.name : "Selecionar paciente"}
                  <Search size={18} className="ml-2 text-gray-500" />
                </Button>
              </div>
            </div>
            {selectedPatient && (
              <div className="text-sm text-gray-500">
                Data de nascimento: {format(new Date(selectedPatient.birthdate), 'dd/MM/yyyy')} 
                ({calculatePatientAge(selectedPatient.birthdate)} anos)
              </div>
            )}
          </div>
          
          {/* Insurance selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Convênio</Label>
            <Select 
              value={selectedInsurance?.id} 
              onValueChange={(value) => {
                const insurance = insuranceCompanies.find(ins => ins.id === value);
                if (insurance) setSelectedInsurance(insurance);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um convênio" />
              </SelectTrigger>
              <SelectContent>
                {insuranceCompanies.map((insurance) => (
                  <SelectItem key={insurance.id} value={insurance.id}>
                    {insurance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Clinical information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Informações Clínicas</Label>
            
            <div className="space-y-2">
              <Label>Coronariografia</Label>
              <Textarea 
                value={coronaryAngiography}
                onChange={(e) => setCoronaryAngiography(e.target.value)}
                placeholder="Descreva os achados da coronariografia..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tratamento Proposto</Label>
              <Textarea 
                value={proposedTreatment}
                onChange={(e) => setProposedTreatment(e.target.value)}
                placeholder="Descreva o tratamento proposto..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          {/* Tuss procedures selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Procedimentos TUSS</Label>
              <Button 
                size="sm" 
                onClick={() => setIsTussModalOpen(true)}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
            
            {selectedTussProcedures.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-md p-4 text-center text-gray-500">
                Nenhum procedimento selecionado
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead className="w-full">Descrição</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTussProcedures.map((procedure) => (
                      <TableRow key={procedure.id}>
                        <TableCell className="font-medium">{procedure.code}</TableCell>
                        <TableCell>{procedure.description}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveTussProcedure(procedure.id)}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          {/* Materials selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Materiais</Label>
              <Button 
                size="sm" 
                onClick={() => setIsMaterialModalOpen(true)}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
            
            {selectedMaterials.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-md p-4 text-center text-gray-500">
                Nenhum material selecionado
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-full">Descrição</TableHead>
                      <TableHead>Qtd.</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>{material.description}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            className="w-16 h-8"
                            value={material.quantity}
                            onChange={(e) => handleMaterialQuantityChange(material.id, parseInt(e.target.value) || 1)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveMaterial(material.id)}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          {/* Surgical team selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Equipe Cirúrgica</Label>
            
            <div className="space-y-2">
              <Label>Cirurgião</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 justify-start text-left"
                  onClick={() => {
                    setSelectedDoctorRole('surgeon');
                    setIsDoctorModalOpen(true);
                  }}
                >
                  {surgicalTeam.surgeon ? (
                    <span>{surgicalTeam.surgeon.name} - {surgicalTeam.surgeon.crm}</span>
                  ) : (
                    "Selecionar cirurgião"
                  )}
                </Button>
                {surgicalTeam.surgeon && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSurgicalTeam({...surgicalTeam, surgeon: null})}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Auxiliar</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 justify-start text-left"
                  onClick={() => {
                    setSelectedDoctorRole('assistant');
                    setIsDoctorModalOpen(true);
                  }}
                >
                  {surgicalTeam.assistant ? (
                    <span>{surgicalTeam.assistant.name} - {surgicalTeam.assistant.crm}</span>
                  ) : (
                    "Selecionar auxiliar"
                  )}
                </Button>
                {surgicalTeam.assistant && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSurgicalTeam({...surgicalTeam, assistant: null})}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Anestesista</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 justify-start text-left"
                  onClick={() => {
                    setSelectedDoctorRole('anesthesiologist');
                    setIsDoctorModalOpen(true);
                  }}
                >
                  {surgicalTeam.anesthesiologist ? (
                    <span>{surgicalTeam.anesthesiologist.name} - {surgicalTeam.anesthesiologist.crm}</span>
                  ) : (
                    "Selecionar anestesista"
                  )}
                </Button>
                {surgicalTeam.anesthesiologist && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSurgicalTeam({...surgicalTeam, anesthesiologist: null})}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Request information */}
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-500">Número da Solicitação</Label>
                <p className="font-medium">{requestNumber}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Data</Label>
                <p className="font-medium">{format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
              
              {hasClinic && (
                <div>
                  <Label className="text-sm text-gray-500">Clínica</Label>
                  <p className="font-medium">{selectedClinic.name}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Generate button - atualizado para mostrar dicas mais claras */}
          <div className="pt-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleGenerateRequest}
              disabled={!hasClinic}
            >
              <Printer className="mr-2 h-5 w-5" />
              Gerar Solicitação de Angioplastia
            </Button>
            {!hasClinic && (
              <p className="text-sm text-red-500 mt-2">
                Selecione uma clínica para continuar
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Patient selection dialog */}
      <Dialog open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Input
                placeholder="Buscar paciente..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            <ScrollArea className="h-72">
              <div className="space-y-2">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <Button
                      key={patient.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setIsPatientModalOpen(false);
                      }}
                    >
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(patient.birthdate), 'dd/MM/yyyy')} 
                          ({calculatePatientAge(patient.birthdate)} anos) • {patient.gender}
                          {patient.phone && ` • ${patient.phone}`}
                        </div>
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum paciente encontrado
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* TUSS procedure selection dialog */}
      <Dialog open={isTussModalOpen} onOpenChange={setIsTussModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Procedimento TUSS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Input
                placeholder="Buscar código ou descrição..."
                value={searchTuss}
                onChange={(e) => setSearchTuss(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            <ScrollArea className="h-72">
              <div className="space-y-2">
                {filteredTussCodes.length > 0 ? (
                  filteredTussCodes.map(tuss => (
                    <div
                      key={tuss.id}
                      className={`border rounded-md p-3 ${
                        selectedTussProcedures.some(t => t.id === tuss.id) ? 'bg-primary/10 border-primary/20' : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{tuss.code} - {tuss.description}</div>
                        </div>
                        <Button
                          size="sm"
                          variant={selectedTussProcedures.some(t => t.id === tuss.id) ? "outline" : "default"}
                          onClick={() => {
                            if (selectedTussProcedures.some(t => t.id === tuss.id)) {
                              handleRemoveTussProcedure(tuss.id);
                            } else {
                              handleAddTussProcedure(tuss);
                            }
                          }}
                        >
                          {selectedTussProcedures.some(t => t.id === tuss.id) ? 'Selecionado' : 'Selecionar'}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum procedimento encontrado
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Material selection dialog */}
      <Dialog open={isMaterialModalOpen} onOpenChange={setIsMaterialModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Input
                placeholder="Buscar material..."
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            <ScrollArea className="h-72">
              <div className="space-y-2">
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map(material => (
                    <div
                      key={material.id}
                      className={`border rounded-md p-3 ${
                        selectedMaterials.some(m => m.id === material.id) ? 'bg-primary/10 border-primary/20' : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{material.description}</div>
                          <div className="text-sm text-gray-500">{material.manufacturer} • {material.code}</div>
                        </div>
                        <Button
                          size="sm"
                          variant={selectedMaterials.some(m => m.id === material.id) ? "outline" : "default"}
                          onClick={() => {
                            if (selectedMaterials.some(m => m.id === material.id)) {
                              handleRemoveMaterial(material.id);
                            } else {
                              handleAddMaterial(material);
                            }
                          }}
                        >
                          {selectedMaterials.some(m => m.id === material.id) ? 'Selecionado' : 'Selecionar'}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum material encontrado
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Doctor selection dialog */}
      <Dialog open={isDoctorModalOpen} onOpenChange={setIsDoctorModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Selecionar {
                selectedDoctorRole === 'surgeon' ? 'Cirurgião' :
                selectedDoctorRole === 'assistant' ? 'Auxiliar' : 'Anestesista'
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Input
                placeholder="Buscar médico..."
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            <ScrollArea className="h-72">
              <div className="space-y-2">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doctor => (
                    <Button
                      key={doctor.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => handleSelectDoctor(doctor)}
                    >
                      <div>
                        <div className="font-medium">{doctor.name}</div>
                        <div className="text-sm text-gray-500">{doctor.crm}</div>
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum médico encontrado
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* PDF preview dialog - atualizado com DialogDescription e mensagem mais clara */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Solicitação de Angioplastia - {requestNumber}</DialogTitle>
            <DialogDescription>
              Visualização do documento para impressão ou download
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {hasClinic ? (
              <PDFViewer
                patient={selectedPatient}
                insurance={selectedInsurance}
                clinic={{
                  id: selectedClinic.id,
                  name: selectedClinic.name,
                  address: selectedClinic.address || '',
                  phone: selectedClinic.phone || '',
                  logo: selectedClinic.logo || '',
                  city: selectedClinic.city || '',
                  email: selectedClinic.email || '',
                  zipCode: '01310-200' // Exemplo
                }}
                tussProcedures={selectedTussProcedures}
                materials={selectedMaterials}
                surgicalTeam={surgicalTeam}
                coronaryAngiography={coronaryAngiography}
                proposedTreatment={proposedTreatment}
                requestNumber={requestNumber}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Nenhuma clínica selecionada</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Você precisa selecionar uma clínica antes de visualizar o PDF.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
