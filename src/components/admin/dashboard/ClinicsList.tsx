
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdminClinic, updateClinicStatus, deleteClinic } from '@/services/admin';
import { Loader2, Search, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ClinicsListProps {
  clinics: AdminClinic[];
  loading: boolean;
  filters: {
    name: string;
    setName: (value: string) => void;
  };
  onOpenFilters: () => void;
  onRefetch: () => void;
}

export const ClinicsList: React.FC<ClinicsListProps> = ({ 
  clinics, 
  loading, 
  filters, 
  onOpenFilters,
  onRefetch 
}) => {
  const { toast } = useToast();
  const [confirmDeleteClinic, setConfirmDeleteClinic] = useState<string | null>(null);
  const [confirmStatusChange, setConfirmStatusChange] = useState<{id: string, active: boolean} | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const handleClinicStatusChange = async () => {
    if (!confirmStatusChange) return;
    
    try {
      await updateClinicStatus(confirmStatusChange.id, confirmStatusChange.active);
      toast({
        title: "Status atualizado",
        description: `Clínica ${confirmStatusChange.active ? 'ativada' : 'desativada'} com sucesso.`,
      });
      onRefetch();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível alterar o status da clínica.",
        variant: "destructive",
      });
    } finally {
      setConfirmStatusChange(null);
    }
  };
  
  const handleDeleteClinic = async () => {
    if (!confirmDeleteClinic) return;
    
    try {
      await deleteClinic(confirmDeleteClinic);
      toast({
        title: "Clínica excluída",
        description: "A clínica foi excluída com sucesso.",
      });
      onRefetch();
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a clínica.",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteClinic(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da clínica..."
            className="pl-8"
            value={filters.name}
            onChange={(e) => filters.setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onRefetch()}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={onOpenFilters}
          className="ml-2"
        >
          <Search className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>
                
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Carregando clínicas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : clinics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nenhuma clínica encontrada
                </TableCell>
              </TableRow>
            ) : (
              clinics.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell>{clinic.city}</TableCell>
                  <TableCell>{clinic.email}</TableCell>
                  <TableCell>{clinic.phone}</TableCell>
                  <TableCell>
                    <Badge variant={clinic.active ? "outline" : "secondary"} className={clinic.active ? "bg-green-100 text-green-800" : ""}>
                      {clinic.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(clinic.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmStatusChange({ id: clinic.id, active: !clinic.active })}
                      >
                        {clinic.active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDeleteClinic(clinic.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de confirmação para excluir clínica */}
      <Dialog open={!!confirmDeleteClinic} onOpenChange={() => setConfirmDeleteClinic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação de Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteClinic(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteClinic}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação para alterar status */}
      <Dialog open={!!confirmStatusChange} onOpenChange={() => setConfirmStatusChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Alteração de Status</DialogTitle>
            <DialogDescription>
              {confirmStatusChange?.active 
                ? "Você tem certeza que deseja ativar esta clínica?" 
                : "Você tem certeza que deseja desativar esta clínica?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmStatusChange(null)}>
              Cancelar
            </Button>
            <Button onClick={handleClinicStatusChange}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
