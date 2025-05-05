
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TussCode {
  id: string;
  code: string;
  description: string;
}

interface Material {
  id: string;
  description: string;
  manufacturer: string;
  code: string;
  compatibleProcedures: string[];
  referencePrice: number;
}

export const MaterialsList = () => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // This would come from a database in a real implementation
  const tussCodes: TussCode[] = [
    { id: '1', code: '30912016', description: 'Angioplastia transluminal percutânea' },
    { id: '2', code: '30912083', description: 'Implante de stent coronário' }
  ];
  
  const [materials, setMaterials] = useState<Material[]>([
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
  ]);
  
  const [currentMaterial, setCurrentMaterial] = useState<Material>({
    id: '',
    description: '',
    manufacturer: '',
    code: '',
    compatibleProcedures: [],
    referencePrice: 0
  });
  
  const handleSave = () => {
    if (!currentMaterial.description || !currentMaterial.code) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (isEditing) {
      setMaterials(prev => 
        prev.map(item => item.id === isEditing ? currentMaterial : item)
      );
      toast.success('Material atualizado com sucesso');
    } else {
      setMaterials(prev => [...prev, { ...currentMaterial, id: Date.now().toString() }]);
      toast.success('Material adicionado com sucesso');
    }
    
    handleCloseSheet();
  };
  
  const handleCloseSheet = () => {
    setIsAddingNew(false);
    setIsEditing(null);
    setCurrentMaterial({
      id: '',
      description: '',
      manufacturer: '',
      code: '',
      compatibleProcedures: [],
      referencePrice: 0
    });
  };
  
  const handleEdit = (material: Material) => {
    setCurrentMaterial(material);
    setIsEditing(material.id);
    setIsAddingNew(true);
  };
  
  const handleDelete = (id: string) => {
    setMaterials(prev => prev.filter(item => item.id !== id));
    toast.success('Material removido com sucesso');
  };
  
  const handleToggleProcedure = (tussId: string) => {
    setCurrentMaterial(prev => {
      const isSelected = prev.compatibleProcedures.includes(tussId);
      
      if (isSelected) {
        return {
          ...prev,
          compatibleProcedures: prev.compatibleProcedures.filter(id => id !== tussId)
        };
      } else {
        return {
          ...prev,
          compatibleProcedures: [...prev.compatibleProcedures, tussId]
        };
      }
    });
  };
  
  const filteredMaterials = materials.filter(material => 
    material.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    material.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProcedureDescriptions = (procedureIds: string[]) => {
    return procedureIds
      .map(id => {
        const tuss = tussCodes.find(t => t.id === id);
        return tuss ? tuss.description : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Cadastro de Materiais</h2>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Buscar por descrição, fabricante ou código..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Fabricante</TableHead>
            <TableHead>Código</TableHead>
            <TableHead className="w-[150px]">Preço (R$)</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMaterials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum material encontrado
              </TableCell>
            </TableRow>
          ) : (
            filteredMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">
                  {material.description}
                  {material.compatibleProcedures.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Compatível com: {getProcedureDescriptions(material.compatibleProcedures)}
                    </div>
                  )}
                </TableCell>
                <TableCell>{material.manufacturer}</TableCell>
                <TableCell>{material.code}</TableCell>
                <TableCell>R$ {material.referencePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(material)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(material.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Add/Edit Sheet */}
      <Sheet open={isAddingNew} onOpenChange={setIsAddingNew}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Editar' : 'Adicionar'} Material</SheetTitle>
            <SheetDescription>
              Preencha os detalhes do material para procedimentos de angioplastia.
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição do Material *
              </label>
              <Input
                id="description"
                value={currentMaterial.description}
                onChange={(e) => setCurrentMaterial(prev => ({...prev, description: e.target.value}))}
                placeholder="Ex: Stent Farmacológico"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="manufacturer" className="text-sm font-medium">
                Fabricante/Modelo
              </label>
              <Input
                id="manufacturer"
                value={currentMaterial.manufacturer}
                onChange={(e) => setCurrentMaterial(prev => ({...prev, manufacturer: e.target.value}))}
                placeholder="Ex: Boston Scientific"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Código do Material *
              </label>
              <Input
                id="code"
                value={currentMaterial.code}
                onChange={(e) => setCurrentMaterial(prev => ({...prev, code: e.target.value}))}
                placeholder="Ex: STE-001"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Compatibilidade com Procedimentos
              </label>
              <div className="border rounded-md p-3 space-y-2">
                {tussCodes.map(tuss => (
                  <div key={tuss.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={`tuss-${tuss.id}`}
                      checked={currentMaterial.compatibleProcedures.includes(tuss.id)}
                      onCheckedChange={() => handleToggleProcedure(tuss.id)}
                    />
                    <label 
                      htmlFor={`tuss-${tuss.id}`} 
                      className="text-sm leading-tight"
                    >
                      <div className="font-medium">{tuss.description}</div>
                      <div className="text-muted-foreground text-xs">TUSS: {tuss.code}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="referencePrice" className="text-sm font-medium">
                Preço Médio de Referência (R$)
              </label>
              <Input
                id="referencePrice"
                type="number"
                step="0.01"
                value={currentMaterial.referencePrice}
                onChange={(e) => setCurrentMaterial(prev => ({...prev, referencePrice: parseFloat(e.target.value)}))}
                placeholder="Ex: 5200.00"
              />
            </div>
          </div>
          
          <SheetFooter>
            <Button variant="outline" onClick={handleCloseSheet}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
