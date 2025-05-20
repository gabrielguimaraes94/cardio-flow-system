
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TussCode } from '@/services/angioplastyService';

interface TussCodeListProps {
  selectedProcedures: TussCode[];
  onAdd: (procedure: TussCode) => void;
  onRemove: (procedureId: string) => void;
}

export const TussCodeList: React.FC<TussCodeListProps> = ({ selectedProcedures, onAdd, onRemove }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [procedures, setProcedures] = useState<TussCode[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<TussCode[]>([]);
  
  // Default TUSS codes for angioplasty
  const defaultTussCodes = [
    { id: '1', code: '30911052', description: 'Angioplastia Coronária' },
    { id: '2', code: '30911060', description: 'Angioplastia Coronária com Implante de Stent' },
    { id: '3', code: '30911079', description: 'Angioplastia Coronária com Implante de Dois ou mais Stents' },
    { id: '4', code: '30911087', description: 'Angioplastia Coronária Primária' },
    { id: '5', code: '30911095', description: 'Angioplastia Coronária com Implante de Stent Farmacológico' },
    { id: '6', code: '30911109', description: 'Angioplastia Coronária em Enxerto Coronário' },
    { id: '7', code: '30911117', description: 'Angioplastia com Implante de Stent em Tronco de Coronária Esquerda' },
  ];
  
  useEffect(() => {
    // Initialize with default TUSS codes
    setProcedures(defaultTussCodes);
    setFilteredProcedures(defaultTussCodes);
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProcedures(procedures);
    } else {
      const filtered = procedures.filter(procedure => 
        procedure.code.includes(searchTerm) || 
        procedure.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProcedures(filtered);
    }
  }, [searchTerm, procedures]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const isProcedureSelected = (procedureId: string) => {
    return selectedProcedures.some(p => p.id === procedureId);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Buscar código TUSS" 
          className="pl-9" 
          value={searchTerm} 
          onChange={handleSearch}
        />
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left font-medium px-4 py-2">Código</th>
              <th className="text-left font-medium px-4 py-2">Descrição</th>
              <th className="w-16 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProcedures.map((procedure) => (
              <tr key={procedure.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-2">{procedure.code}</td>
                <td className="px-4 py-2">{procedure.description}</td>
                <td className="px-4 py-2 text-right">
                  {isProcedureSelected(procedure.id) ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemove(procedure.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onAdd(procedure)}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            
            {filteredProcedures.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted-foreground">
                  Nenhum código TUSS encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Selecionados ({selectedProcedures.length})</h4>
        {selectedProcedures.length > 0 ? (
          <ul className="space-y-1">
            {selectedProcedures.map(procedure => (
              <li key={procedure.id} className="flex justify-between items-center bg-muted/50 px-3 py-1 rounded-md text-sm">
                <span>
                  <strong>{procedure.code}</strong> - {procedure.description}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemove(procedure.id)}
                  className="h-6 w-6 p-0"
                >
                  <Trash className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum código TUSS selecionado</p>
        )}
      </div>
    </div>
  );
};
