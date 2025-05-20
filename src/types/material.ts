
import { TussCode } from '@/components/angioplasty/TussCodeList';

export interface Material {
  id: string;
  description: string;
  manufacturer: string;
  code: string;
  compatibleProcedures: string[];
  referencePrice?: number;
}

export interface MaterialWithQuantity extends Material {
  quantity: number;
  referencePrice?: number;
}

export interface MaterialsListProps {
  selectedMaterials: MaterialWithQuantity[];
  onAdd: (material: MaterialWithQuantity) => void;
  onRemove: (materialId: string) => void;
  onUpdateQuantity: (materialId: string, quantity: number) => void;
  selectedProcedures: TussCode[];
}
