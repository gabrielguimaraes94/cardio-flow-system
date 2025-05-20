
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash, MinusCircle, PlusCircle, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Material {
  id: string;
  description: string;
  manufacturer?: string;
  code?: string;
  compatibleProcedures?: string[];
}

export interface MaterialWithQuantity extends Material {
  quantity: number;
}

interface MaterialsListProps {
  selectedMaterials: MaterialWithQuantity[];
  onAdd: (material: MaterialWithQuantity) => void;
  onRemove: (materialId: string) => void;
  onUpdateQuantity: (materialId: string, quantity: number) => void;
  selectedProcedures?: {id: string}[];
}

export const MaterialsList: React.FC<MaterialsListProps> = ({ 
  selectedMaterials, 
  onAdd, 
  onRemove,
  onUpdateQuantity,
  selectedProcedures = []
}) => {
  const [open, setOpen] = useState(false);
  const [customMaterial, setCustomMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Default materials for angioplasty
  const defaultMaterials: Material[] = [
    { id: '1', description: 'Cateter Balão', manufacturer: 'Boston Scientific', code: 'CB-001' },
    { id: '2', description: 'Stent Convencional', manufacturer: 'Medtronic', code: 'SC-002' },
    { id: '3', description: 'Stent Farmacológico', manufacturer: 'Abbott', code: 'SF-003' },
    { id: '4', description: 'Fio Guia 0.014"', manufacturer: 'Terumo', code: 'FG-004' },
    { id: '5', description: 'Cateter Guia', manufacturer: 'Cordis', code: 'CG-005' },
    { id: '6', description: 'Introdutor Femoral', manufacturer: 'B.Braun', code: 'IF-006' },
    { id: '7', description: 'Sistema de Compressão Radial', manufacturer: 'Terumo', code: 'TR-007' },
    { id: '8', description: 'Contraste', manufacturer: 'GE Healthcare', code: 'CO-008' },
  ];

  const handleAddCustomMaterial = () => {
    if (customMaterial.trim().length === 0) return;
    
    const newMaterial: MaterialWithQuantity = {
      id: `custom-${Date.now()}`,
      description: customMaterial,
      quantity: quantity
    };
    
    onAdd(newMaterial);
    setCustomMaterial('');
    setQuantity(1);
    setOpen(false);
  };

  const handleAddMaterial = (material: Material) => {
    const materialWithQuantity: MaterialWithQuantity = {
      ...material,
      quantity: 1
    };
    onAdd(materialWithQuantity);
    setOpen(false);
  };

  const handleUpdateQuantity = (materialId: string, currentQuantity: number, increment: boolean) => {
    const newQuantity = increment ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
    onUpdateQuantity(materialId, newQuantity);
  };

  const isMaterialSelected = (materialId: string) => {
    return selectedMaterials.some(m => m.id === materialId);
  };

  const filteredMaterials = defaultMaterials.filter(material => {
    if (!material.compatibleProcedures || material.compatibleProcedures.length === 0) {
      return true;
    }
    
    if (selectedProcedures.length === 0) {
      return true;
    }
    
    return selectedProcedures.some(proc => 
      material.compatibleProcedures?.includes(proc.id)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 justify-between">
              Selecionar materiais
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar material..." />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2">
                    <p className="mb-2 text-sm">Nenhum material encontrado. Adicionar novo:</p>
                    <div className="flex gap-2">
                      <Input 
                        value={customMaterial}
                        onChange={(e) => setCustomMaterial(e.target.value)}
                        placeholder="Nome do material"
                        className="flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleAddCustomMaterial}
                        disabled={customMaterial.trim().length === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Adicionar
                      </Button>
                    </div>
                  </div>
                </CommandEmpty>
                <CommandGroup heading="Materiais">
                  <ScrollArea className="h-[200px]">
                    {filteredMaterials.map((material) => (
                      <CommandItem
                        key={material.id}
                        value={`${material.description}-${material.manufacturer || ''}`}
                        onSelect={() => !isMaterialSelected(material.id) && handleAddMaterial(material)}
                        className="flex items-center justify-between p-2"
                        disabled={isMaterialSelected(material.id)}
                      >
                        <div>
                          <div className="font-medium">{material.description}</div>
                          {material.manufacturer && (
                            <div className="text-xs text-muted-foreground">{material.manufacturer}</div>
                          )}
                        </div>
                        {isMaterialSelected(material.id) ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CommandItem>
                    ))}
                    <CommandItem className="p-2">
                      <div className="w-full">
                        <p className="mb-2 text-sm">Adicionar material personalizado:</p>
                        <div className="flex gap-2">
                          <Input 
                            value={customMaterial}
                            onChange={(e) => setCustomMaterial(e.target.value)}
                            placeholder="Nome do material"
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleAddCustomMaterial}
                            disabled={customMaterial.trim().length === 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CommandItem>
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Materiais selecionados ({selectedMaterials.length})</h4>
        {selectedMaterials.length > 0 ? (
          <ul className="space-y-2">
            {selectedMaterials.map(material => (
              <li key={material.id} className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-md">
                <div>
                  <span className="font-medium">{material.description}</span>
                  {material.manufacturer && (
                    <div className="text-xs text-muted-foreground">{material.manufacturer} {material.code && `- ${material.code}`}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUpdateQuantity(material.id, material.quantity, false)}
                      className="h-6 w-6 p-0"
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{material.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUpdateQuantity(material.id, material.quantity, true)}
                      className="h-6 w-6 p-0"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemove(material.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum material selecionado</p>
        )}
      </div>
    </div>
  );
};
