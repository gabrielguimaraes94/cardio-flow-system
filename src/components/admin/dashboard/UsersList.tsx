
import React from 'react';
import { AdminUser } from '@/services/admin';
import { Loader2, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { deleteUser } from '@/services/admin';

interface UsersListProps {
  users: AdminUser[];
  loading: boolean;
  filters: {
    name: string;
    setName: (value: string) => void;
  };
  onOpenFilters: () => void;
  onRefetch: () => void;
}

export const UsersList: React.FC<UsersListProps> = ({ 
  users, 
  loading, 
  filters, 
  onOpenFilters,
  onRefetch 
}) => {
  const { toast } = useToast();
  
  // Log detalhado dos dados recebidos
  console.log('=== USERLIST COMPONENT ===');
  console.log('Props recebidas:');
  console.log('- users:', users);
  console.log('- users.length:', users?.length || 0);
  console.log('- loading:', loading);
  console.log('- filters:', filters);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };
  
  const getRoleName = (role: string): string => {
    const roleNames: Record<string, string> = {
      admin: 'Administrador Global',
      clinic_admin: 'Admin. Clínica',
      doctor: 'Médico',
      nurse: 'Enfermeiro',
      receptionist: 'Recepção',
      staff: 'Equipe',
    };
    return roleNames[role] || role;
  };
  
  const getRoleColor = (role: string): string => {
    const roleColors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      clinic_admin: 'bg-purple-100 text-purple-800',
      doctor: 'bg-blue-100 text-blue-800',
      nurse: 'bg-green-100 text-green-800',
      receptionist: 'bg-yellow-100 text-yellow-800',
      staff: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      console.log('Iniciando exclusão do usuário:', userId);
      await deleteUser(userId);
      
      toast({
        title: "Usuário excluído",
        description: `${userName} foi excluído com sucesso.`,
      });
      
      onRefetch();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Ocorreu um erro ao tentar excluir o usuário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do usuário..."
            className="pl-8"
            value={filters.name}
            onChange={(e) => filters.setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onRefetch()}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={onOpenFilters}
          className="w-full sm:w-auto"
        >
          <Search className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Nome</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Tipo</TableHead>
                <TableHead className="min-w-[100px]">CRM</TableHead>
                <TableHead className="min-w-[120px]">Telefone</TableHead>
                <TableHead className="min-w-[150px]">Criado em</TableHead>
                <TableHead className="min-w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Carregando usuários...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    <div>
                      <p>❌ Nenhum usuário encontrado</p>
                      <p className="text-sm mt-2">Verifique o console para logs detalhados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => {
                  console.log(`Renderizando usuário ${index + 1}:`, user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="min-w-0">
                          <div className="truncate">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <div className="truncate">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(user.role)}>
                          {getRoleName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="truncate">{user.crm || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate">{user.phone || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate">{formatDate(user.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};
