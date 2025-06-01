
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, X } from 'lucide-react';
import { AngioplastyRequest, angioplastyService } from '@/services/angioplastyService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AngioplastyRequestActionsProps {
  request: AngioplastyRequest;
  onRequestUpdated: () => void;
}

export const AngioplastyRequestActions: React.FC<AngioplastyRequestActionsProps> = ({
  request,
  onRequestUpdated
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCancel = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setIsCancelling(true);
    try {
      const success = await angioplastyService.cancelRequest(
        request.id,
        user.id,
        "Solicitação cancelada pelo usuário"
      );

      if (success) {
        toast({
          title: "Solicitação cancelada",
          description: "A solicitação foi cancelada com sucesso."
        });
        onRequestUpdated();
      } else {
        throw new Error("Falha ao cancelar solicitação");
      }
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error);
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
      setIsDialogOpen(false);
    }
  };

  const handleView = () => {
    navigate(`/angioplasty/view/${request.id}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </DropdownMenuItem>
          {request.status === 'active' && (
            <DropdownMenuItem 
              onClick={() => setIsDialogOpen(true)}
              className="text-red-600 focus:text-red-600"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a solicitação {request.requestNumber}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? "Cancelando..." : "Confirmar Cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
