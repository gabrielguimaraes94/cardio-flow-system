
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';

interface ClinicFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    name: string;
    city: string;
    active: boolean | undefined;
    createdAfter: string | undefined;
    createdBefore: string | undefined;
  };
  onFilterChange: (key: string, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const ClinicFilters: React.FC<ClinicFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtrar Clínicas</DialogTitle>
          <DialogDescription>
            Aplique filtros para refinar a lista de clínicas exibidas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome</label>
              <Input
                placeholder="Filtrar por nome"
                value={filters.name}
                onChange={(e) => onFilterChange('name', e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Cidade</label>
              <Input
                placeholder="Filtrar por cidade"
                value={filters.city}
                onChange={(e) => onFilterChange('city', e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select 
                value={filters.active?.toString() || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    onFilterChange('active', undefined);
                  } else {
                    onFilterChange('active', value === "true");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Ativas</SelectItem>
                  <SelectItem value="false">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Criado após</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {filters.createdAfter 
                        ? format(new Date(filters.createdAfter), 'dd/MM/yyyy')
                        : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.createdAfter ? new Date(filters.createdAfter) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          onFilterChange('createdAfter', date.toISOString());
                        } else {
                          onFilterChange('createdAfter', undefined);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Criado antes</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {filters.createdBefore 
                        ? format(new Date(filters.createdBefore), 'dd/MM/yyyy')
                        : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.createdBefore ? new Date(filters.createdBefore) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          onFilterChange('createdBefore', date.toISOString());
                        } else {
                          onFilterChange('createdBefore', undefined);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={onApplyFilters}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
