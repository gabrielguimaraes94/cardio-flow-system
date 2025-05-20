
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { z } from "zod";

// Schema para validação dos materiais
const materialSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  manufacturer: z.string().min(1, "Fabricante é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
});

type Material = {
  id: string;
  description: string;
  manufacturer: string;
  code: string;
  compatibleProcedures: string[];
};

type TussCode = {
  id: string;
  code: string;
  description: string;
};

export const MaterialsSettings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newCode, setNewCode] = useState('');
  const [compatibleProcedures, setCompatibleProcedures] = useState<string[]>([]);
  
  // Mock data de procedimentos TUSS para compatibilidade
  const tussCodes: TussCode[] = [
    {
      id: '1',
      code: '30912016',
      description: 'Angioplastia transluminal percutânea'
    },
    {
      id: '2',
      code: '30912083',
      description: 'Implante de stent coronário'
    }
  ];

  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      description: 'Stent Farmacológico',
      manufacturer: 'Boston Scientific',
      code: 'STE-001',
      compatibleProcedures: ['2'],
    },
    {
      id: '2',
      description: 'Cateter Balão',
      manufacturer: 'Medtronic',
      code: 'CAT-002',
      compatibleProcedures: ['1', '2'],
    }
  ]);

  const filteredMaterials = materials.filter(material => 
    material.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    material.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMaterial = () => {
    try {
      // Validação com Zod
      const validatedData = materialSchema.parse({
        description: newDescription,
        manufacturer: newManufacturer,
        code: newCode
      });

      const newMaterial: Material = {
        id: `${Date.now()}`, // Simples geração de ID para exemplo
        description: validatedData.description,
        manufacturer: validatedData.manufacturer,
        code: validatedData.code,
        compatibleProcedures,
      };

      setMaterials([...materials, newMaterial]);
      setIsDialogOpen(false);
      resetForm();
      toast.success('Material adicionado com sucesso');
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error('Erro ao adicionar material');
      }
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id));
    toast.success('Material removido com sucesso');
  };

  const toggleProcedureCompatibility = (procedureId: string) => {
    if (compatibleProcedures.includes(procedureId)) {
      setCompatibleProcedures(compatibleProcedures.filter(id => id !== procedureId));
    } else {
      setCompatibleProcedures([...compatibleProcedures, procedureId]);
    }
  };

  const resetForm = () => {
    setNewDescription('');
    setNewManufacturer('');
    setNewCode('');
    setCompatibleProcedures([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle>Configuração de Materiais</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-cardio-500 hover:bg-cardio-600">
            <Plus className="h-4 w-4 mr-2" />
            Novo Material
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="search" 
                placeholder="Buscar materiais..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="w-[10%] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>{material.description}</TableCell>
                      <TableCell>{material.manufacturer}</TableCell>
                      <TableCell>{material.code}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material-description">Descrição</Label>
                <Input 
                  id="material-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ex: Stent Farmacológico"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-manufacturer">Fabricante</Label>
                <Input
                  id="material-manufacturer"
                  value={newManufacturer}
                  onChange={(e) => setNewManufacturer(e.target.value)}
                  placeholder="Ex: Boston Scientific"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-code">Código</Label>
                <Input
                  id="material-code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ex: STE-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Procedimentos Compatíveis</Label>
                <div className="border rounded-md p-3 space-y-2">
                  {tussCodes.map((tuss) => (
                    <div key={tuss.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`proc-${tuss.id}`}
                        checked={compatibleProcedures.includes(tuss.id)}
                        onCheckedChange={() => toggleProcedureCompatibility(tuss.id)}
                      />
                      <label 
                        htmlFor={`proc-${tuss.id}`} 
                        className="text-sm leading-tight"
                      >
                        <div className="font-medium">{tuss.description}</div>
                        <div className="text-muted-foreground text-xs">
                          TUSS: {tuss.code}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-cardio-500 hover:bg-cardio-600" 
              onClick={handleAddMaterial}
            >
              Adicionar Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
