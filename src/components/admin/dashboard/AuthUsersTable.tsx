
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AuthUser {
  auth_user_id: string;
  auth_email: string;
  auth_created_at: string;
  has_profile: boolean;
}

interface AuthUsersTableProps {
  authUsers: AuthUser[];
  loading: boolean;
}

export const AuthUsersTable: React.FC<AuthUsersTableProps> = ({ 
  authUsers, 
  loading 
}) => {
  console.log('=== AUTH USERS TABLE COMPONENT ===');
  console.log('Props recebidas:');
  console.log('- authUsers:', authUsers);
  console.log('- authUsers.length:', authUsers?.length || 0);
  console.log('- loading:', loading);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="bg-blue-50 px-4 py-2 border-b">
        <h3 className="font-semibold text-blue-800">Usuários Auth.Users</h3>
        <p className="text-sm text-blue-600">Tabela de autenticação do Supabase</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">ID do Usuário</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[150px]">Criado em</TableHead>
              <TableHead className="min-w-[120px]">Tem Profile?</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Carregando usuários auth...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : authUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  <div>
                    <p>❌ Nenhum usuário auth encontrado</p>
                    <p className="text-sm mt-2">Verifique o console para logs detalhados</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              authUsers.map((user, index) => {
                console.log(`Renderizando auth user ${index + 1}:`, user);
                return (
                  <TableRow key={user.auth_user_id}>
                    <TableCell className="font-mono text-xs">
                      <div className="min-w-0">
                        <div className="truncate">{user.auth_user_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <div className="truncate">{user.auth_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="truncate">{formatDate(user.auth_created_at)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.has_profile ? "default" : "destructive"}>
                        {user.has_profile ? "✅ Sim" : "❌ Não"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
