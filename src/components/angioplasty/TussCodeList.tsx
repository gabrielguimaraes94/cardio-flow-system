import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export interface TussCode {
  id: string;
  code: string;
  description: string;
  justifications?: string[];
  referenceValue?: number; // Added to fix the type errors
}

interface TussCodeListProps {
  selectedProcedures: TussCode[];
  onAdd: (tuss: TussCode) => void;
  onRemove: (tussId: string) => void;
}

export const TussCodeList: React.FC<TussCodeListProps> = ({
  selectedProcedures,
  onAdd,
  onRemove,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableTussCodes, setAvailableTussCodes] = useState<TussCode[]>([
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
  ]);

  const filteredTussCodes = availableTussCodes.filter(tuss =>
    tuss.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tuss.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProcedure = (tuss: TussCode) => {
    onAdd(tuss);
  };

  const handleRemoveProcedure = (tussId: string) => {
    onRemove(tussId);
  };

  const isProcedureSelected = (tussId: string) => {
    return selectedProcedures.some(proc => proc.id === tussId);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar procedimento TUSS..."
          className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -mt-2.5 h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTussCodes.map(tuss => (
              <TableRow key={tuss.id}>
                <TableCell className="font-medium">{tuss.code}</TableCell>
                <TableCell>{tuss.description}</TableCell>
                <TableCell className="text-right">
                  {isProcedureSelected(tuss.id) ? (
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveProcedure(tuss.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => handleAddProcedure(tuss)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredTussCodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Nenhum procedimento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {selectedProcedures.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-medium">Procedimentos Selecionados:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedProcedures.map(proc => (
              <Badge key={proc.id} variant="secondary">
                {proc.description}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
