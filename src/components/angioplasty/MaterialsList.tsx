
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash, MinusCircle, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MaterialWithQuantity } from '@/services/angioplastyService';

interface MaterialsListProps {
  selectedMaterials: MaterialWithQuantity[];
  onAdd: (material: MaterialWithQuantity) => void;
  onRemove: (materialId: string) => void;
  onUpdateQuantity: (materialId: string, quantity: number) => void;
}

export const MaterialsList: React.FC<MaterialsListProps> = ({ 
  selectedMaterials, 
  onAdd, 
  onRemove,
  onUpdateQuantity
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customMaterial, setCustomMaterial] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [materials, setMaterials] = useState<{id: string, description: string}[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<{id: string, description: string}[]>([]);
  
  // Default materials for angioplasty
  const defaultMaterials = [
    { id: '1', description: 'Cateter Balão' },
    { id: '2', description: 'Stent Convencional' },
    { id: '3', description: 'Stent Farmacológico' },
    { id: '4', description: 'Fio Guia 0.014"' },
    { id: '5', description: 'Cateter Guia' },
    { id: '6', description: 'Introdutor Femoral' },
    { id: '7', description: 'Sistema de Compressão Radial' },
    { id: '8', description: 'Contraste' },
  ];
  
  useEffect(() => {
    // Initialize with default materials
    setMaterials(defaultMaterials);
    setFilteredMaterials(defaultMaterials);
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter(material => 
        material.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  }, [searchTerm, materials]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddCustomMaterial = () => {
    if (customMaterial.trim().length === 0) return;
    
    const newMaterial: MaterialWithQuantity = {
      id: `custom-${Date.now()}`,
      description: customMaterial,
      quantity
    };
    
    onAdd(newMaterial);
    setCustomMaterial('');
    setQuantity(1);
  };

  const handleAddMaterial = (materialId: string, description: string) => {
    const material: MaterialWithQuantity = {
      id: materialId,
      description,
      quantity
    };
    
    onAdd(material);
    setQuantity(1);
  };

  const handleUpdateQuantity = (materialId: string, currentQuantity: number, increment: boolean) => {
    const newQuantity = increment ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
    onUpdateQuantity(materialId, newQuantity);
  };

  const isMaterialSelected = (materialId: string) => {
    return selectedMaterials.some(m => m.id === materialId);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Buscar material" 
          className="pl-9" 
          value={searchTerm} 
          onChange={handleSearch}
        />
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left font-medium px-4 py-2">Material</th>
              <th className="text-center font-medium px-4 py-2 w-24">Qtd.</th>
              <th className="w-16 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((material) => (
              <tr key={material.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-2">{material.description}</td>
                <td className="px-4 py-2 text-center">
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-7 w-16 text-center"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  {isMaterialSelected(material.id) ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemove(material.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAddMaterial(material.id, material.description)}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            
            <tr className="border-t">
              <td className="px-4 py-2">
                <Input 
                  placeholder="Adicionar outro material..." 
                  value={customMaterial}
                  onChange={(e) => setCustomMaterial(e.target.value)}
                  className="h-7"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <Input 
                  type="number" 
                  min="1" 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="h-7 w-16 text-center"
                />
              </td>
              <td className="px-4 py-2 text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddCustomMaterial}
                  className="h-7 w-7 p-0"
                  disabled={customMaterial.trim().length === 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </td>
            </tr>
            
            {filteredMaterials.length === 0 && searchTerm.trim() !== '' && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted-foreground">
                  Nenhum material encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Materiais Selecionados ({selectedMaterials.length})</h4>
        {selectedMaterials.length > 0 ? (
          <ul className="space-y-1">
            {selectedMaterials.map(material => (
              <li key={material.id} className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-md text-sm">
                <span>{material.description}</span>
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
                    className="h-6 w-6 p-0"
                  >
                    <Trash className="h-3.5 w-3.5 text-red-500" />
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
