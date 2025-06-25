
import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ProfileData } from '@/services/admin/profileService';

interface ProfilesTableProps {
  profiles: ProfileData[];
  loading: boolean;
}

export const ProfilesTable: React.FC<ProfilesTableProps> = ({ 
  profiles, 
  loading 
}) => {
  console.log('=== PROFILES TABLE COMPONENT ===');
  console.log('Props recebidas:');
  console.log('- profiles:', profiles);
  console.log('- profiles.length:', profiles?.length || 0);
  console.log('- loading:', loading);
  
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

  return (
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
              <TableHead className="min-w-[100px]">Título</TableHead>
              <TableHead className="min-w-[150px]">Criado em</TableHead>
              <TableHead className="min-w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Carregando profiles...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  <div>
                    <p>❌ Nenhum profile encontrado</p>
                    <p className="text-sm mt-2">Verifique o console para logs detalhados</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile, index) => {
                console.log(`Renderizando profile ${index + 1}:`, profile);
                return (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <div className="truncate">
                          {profile.first_name} {profile.last_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <div className="truncate">{profile.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(profile.role)}>
                        {getRoleName(profile.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="truncate">{profile.crm || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="truncate">{profile.phone || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="truncate">{profile.title || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="truncate">{formatDate(profile.created_at)}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
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
  );
};
