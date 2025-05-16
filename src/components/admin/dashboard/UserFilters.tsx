
import React from 'react';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';

type UserRole = Database["public"]["Enums"]["user_role"];

interface UserFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    name: string;
    role: UserRole | '';
    createdAfter: string | undefined;
    createdBefore: string | undefined;
  };
  onFilterChange: (key: string, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
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
          <DialogTitle>Filtrar Usuários</DialogTitle>
          <DialogDescription>
            Aplique filtros para refinar a lista de usuários exibidos.
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
              <label className="text-sm font-medium mb-1 block">Perfil</label>
              <Select 
                value={filters.role || "all"}
                onValueChange={(value) => {
                  onFilterChange('role', value === "all" ? '' : value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os perfis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administrador Global</SelectItem>
                  <SelectItem value="clinic_admin">Admin. Clínica</SelectItem>
                  <SelectItem value="doctor">Médico</SelectItem>
                  <SelectItem value="nurse">Enfermeiro</SelectItem>
                  <SelectItem value="receptionist">Recepção</SelectItem>
                  <SelectItem value="staff">Equipe</SelectItem>
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
