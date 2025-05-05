import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserDialog } from './UserDialog';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';

// User type with roles
type UserRole = 'admin' | 'clinic_admin' | 'doctor' | 'nurse' | 'receptionist';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinics: string[];
  active: boolean;
}

export const UserManagement = () => {
  const { selectedClinic } = useClinic();
  const { toast } = useToast();
  
  const [allUsers, setAllUsers] = useState<User[]>([
    { id: '1', name: 'Dr. Carlos Silva', email: 'carlos.silva@cardio.com', role: 'doctor', clinics: ['Cardio Center', 'Instituto Cardiovascular'], active: true },
    { id: '2', name: 'Amanda Lopes', email: 'amanda@cardio.com', role: 'nurse', clinics: ['Cardio Center'], active: true },
    { id: '3', name: 'Patricia Santos', email: 'patricia@cardio.com', role: 'receptionist', clinics: ['Cardio Center'], active: true },
    { id: '4', name: 'Marcos Oliveira', email: 'marcos@cardio.com', role: 'clinic_admin', clinics: ['Instituto Cardiovascular'], active: true },
    { id: '5', name: 'Ana Costa', email: 'ana@admin.com', role: 'admin', clinics: ['Cardio Center', 'Instituto Cardiovascular', 'Clínica do Coração'], active: true },
  ]);
  
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Filter users based on selected clinic
  useEffect(() => {
    if (selectedClinic) {
      const filteredUsers = allUsers.filter(user => 
        // Admins see all users across all clinics
        user.role === 'admin' || 
        // Other users are filtered by their clinic association
        user.clinics.includes(selectedClinic.name)
      );
      setUsers(filteredUsers);

      // Show toast notification when clinic is changed
      toast({
        title: "Clínica alterada",
        description: `Mostrando usuários da clínica: ${selectedClinic.name}`,
      });
    }
  }, [selectedClinic, allUsers]);

  // Listen for clinic change events
  useEffect(() => {
    const handleClinicChange = () => {
      // This will trigger the useEffect above
      setSearchTerm('');
    };

    window.addEventListener('clinicChanged', handleClinicChange);
    return () => {
      window.removeEventListener('clinicChanged', handleClinicChange);
    };
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleName = (role: UserRole): string => {
    const roleNames = {
      admin: 'Administrador',
      clinic_admin: 'Admin. Clínica',
      doctor: 'Médico',
      nurse: 'Enfermeiro',
      receptionist: 'Recepção'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: UserRole): string => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      clinic_admin: 'bg-purple-100 text-purple-800',
      doctor: 'bg-blue-100 text-blue-800',
      nurse: 'bg-green-100 text-green-800',
      receptionist: 'bg-yellow-100 text-yellow-800'
    };
    return roleColors[role] || '';
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsDialogOpen(true);
  };

  const handleSaveUser = (user: User) => {
    if (currentUser) {
      // Edit existing user
      setAllUsers(allUsers.map(u => u.id === user.id ? user : u));
    } else {
      // Add new user
      setAllUsers([...allUsers, { ...user, id: Date.now().toString() }]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    setAllUsers(allUsers.filter(user => user.id !== userId));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestão de Usuários</CardTitle>
            <CardDescription>
              {selectedClinic 
                ? `Gerenciando usuários da clínica: ${selectedClinic.name}` 
                : 'Gerencie os usuários do sistema e suas permissões.'}
            </CardDescription>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Clínicas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleColor(user.role)}>
                      {getRoleName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.clinics.join(', ')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <UserDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSave={handleSaveUser} 
        user={currentUser} 
      />
    </Card>
  );
};
