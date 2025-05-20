
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash, Check } from 'lucide-react';
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

export interface TussCode {
  id: string;
  code: string;
  description: string;
  justifications?: string[];
  referenceValue?: number;
}

interface TussCodeListProps {
  selectedProcedures: TussCode[];
  onAdd: (procedure: TussCode) => void;
  onRemove: (procedureId: string) => void;
}

export const TussCodeList: React.FC<TussCodeListProps> = ({ selectedProcedures, onAdd, onRemove }) => {
  const [open, setOpen] = useState(false);
  
  // Default TUSS codes for angioplasty
  const defaultTussCodes: TussCode[] = [
    { id: '1', code: '30911052', description: 'Angioplastia Coronária', referenceValue: 4500.00 },
    { id: '2', code: '30911060', description: 'Angioplastia Coronária com Implante de Stent', referenceValue: 6800.00 },
    { id: '3', code: '30911079', description: 'Angioplastia Coronária com Implante de Dois ou mais Stents', referenceValue: 7500.00 },
    { id: '4', code: '30911087', description: 'Angioplastia Coronária Primária', referenceValue: 5200.00 },
    { id: '5', code: '30911095', description: 'Angioplastia Coronária com Implante de Stent Farmacológico', referenceValue: 8500.00 },
    { id: '6', code: '30911109', description: 'Angioplastia Coronária em Enxerto Coronário', referenceValue: 7800.00 },
    { id: '7', code: '30911117', description: 'Angioplastia com Implante de Stent em Tronco de Coronária Esquerda', referenceValue: 9000.00 },
  ];

  const isProcedureSelected = (procedureId: string) => {
    return selectedProcedures.some(p => p.id === procedureId);
  };

  const toggleProcedure = (procedure: TussCode) => {
    if (isProcedureSelected(procedure.id)) {
      onRemove(procedure.id);
    } else {
      onAdd(procedure);
    }
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedProcedures.length > 0 ? (
              <span>
                {selectedProcedures.length} procedimento(s) selecionado(s)
              </span>
            ) : (
              <span>Selecionar procedimentos TUSS</span>
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar código TUSS ou descrição..." />
            <CommandList>
              <CommandEmpty>Nenhum procedimento encontrado.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {defaultTussCodes.map((procedure) => (
                    <CommandItem
                      key={procedure.id}
                      value={`${procedure.code}-${procedure.description}`}
                      onSelect={() => toggleProcedure(procedure)}
                      className="flex items-center justify-between p-2"
                    >
                      <div>
                        <div className="font-medium">{procedure.code}</div>
                        <div className="text-sm text-muted-foreground">{procedure.description}</div>
                      </div>
                      {isProcedureSelected(procedure.id) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Procedimentos selecionados ({selectedProcedures.length})</h4>
        {selectedProcedures.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedProcedures.map(procedure => (
              <Badge key={procedure.id} variant="secondary" className="flex items-center gap-1 py-1.5">
                <span>
                  <span className="font-medium">{procedure.code}</span> - {procedure.description}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(procedure.id)}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <Trash className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum procedimento TUSS selecionado</p>
        )}
      </div>
    </div>
  );
};
