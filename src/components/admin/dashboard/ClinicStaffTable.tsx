
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ClinicStaffMember {
  id: string;
  user_id: string;
  clinic_id: string;
  role: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  clinic_name?: string;
}

interface ClinicStaffTableProps {
  clinicStaff: ClinicStaffMember[];
  loading: boolean;
}

export const ClinicStaffTable: React.FC<ClinicStaffTableProps> = ({ 
  clinicStaff, 
  loading 
}) => {
  console.log('=== CLINIC STAFF TABLE COMPONENT ===');
  console.log('Props recebidas:');
  console.log('- clinicStaff:', clinicStaff);
  console.log('- clinicStaff.length:', clinicStaff?.length || 0);
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
      doctor: 'Médico',
      nurse: 'Enfermeiro',
      receptionist: 'Recepção',
      staff: 'Equipe',
    };
    return roleNames[role] || role;
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="bg-green-50 px-4 py-2 border-b">
        <h3 className="font-semibold text-green-800">Equipe das Clínicas (Clinic_Staff)</h3>
        <p className="text-sm text-green-600">Relacionamento usuários x clínicas</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">ID Staff</TableHead>
              <TableHead className="min-w-[200px]">ID Usuário</TableHead>
              <TableHead className="min-w-[200px]">ID Clínica</TableHead>
              <TableHead className="min-w-[100px]">Função</TableHead>
              <TableHead className="min-w-[80px]">Admin?</TableHead>
              <TableHead className="min-w-[80px]">Ativo?</TableHead>
              <TableHead className="min-w-[120px]">Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Carregando equipe...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : clinicStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  <div>
                    <p>❌ Nenhum membro de equipe encontrado</p>
                    <p className="text-sm mt-2">Verifique o console para logs detalhados</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clinicStaff.map((staff, index) => {
                console.log(`Renderizando staff ${index + 1}:`, staff);
                return (
                  <TableRow key={staff.id}>
                    <TableCell className="font-mono text-xs">
                      <div className="min-w-0">
                        <div className="truncate">{staff.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="min-w-0">
                        <div className="truncate">{staff.user_id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="min-w-0">
                        <div className="truncate">{staff.clinic_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getRoleName(staff.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={staff.is_admin ? "default" : "secondary"}>
                        {staff.is_admin ? "✅ Sim" : "❌ Não"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={staff.active ? "default" : "destructive"}>
                        {staff.active ? "✅ Ativo" : "❌ Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="truncate">{formatDate(staff.created_at)}</div>
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
