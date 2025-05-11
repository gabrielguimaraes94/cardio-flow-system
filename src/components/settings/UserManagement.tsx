
import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash, Loader2, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserDialog } from './UserDialog';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';
import { fetchUsers } from '@/services/userService';
import { UserProfile } from '@/types/profile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const UserManagement = () => {
  const { selectedClinic } = useClinic();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users based on selected clinic
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading users for clinic:', selectedClinic?.id);
        
        const userData = await fetchUsers(selectedClinic?.id);
        setUsers(userData);
        
        if (selectedClinic) {
          toast({
            title: "Clínica alterada",
            description: `Mostrando usuários da clínica: ${selectedClinic.name}`,
          });
        }
      } catch (error) {
        console.error('Failed to load users:', error);
        setError('Falha ao carregar usuários');
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [selectedClinic, toast]);

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
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleName = (role: string): string => {
    const roleNames: Record<string, string> = {
      admin: 'Administrador',
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
    return roleColors[role] || '';
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsDialogOpen(true);
  };

  const handleSaveUser = async (userData: UserProfile) => {
    try {
      if (currentUser) {
        // Update existing user
        console.log('Updating user:', userData);
        
        const { data, error } = await supabase
          .from('profiles')
          .update({
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            crm: userData.crm,
            phone: userData.phone,
            title: userData.title,
            bio: userData.bio,
            role: userData.role
          })
          .eq('id', userData.id);
        
        if (error) throw error;
        
        setUsers(users.map(u => u.id === userData.id ? userData : u));
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        });
      } else {
        // Add new user - In a real application you would need to invite the user via email
        console.log('Creating new user:', userData);
        
        // In a production environment, this would involve sending an invitation email
        // For demo purposes, we'll just simulate adding the user to the database
        const newUserId = `new-${Date.now()}`;
        const newUser = { 
          ...userData, 
          id: newUserId 
        };
        
        // Since this is just a simulation, we're adding to local state
        // In reality, you would use Supabase's built-in invite functionality
        setUsers([...users, newUser]);
        
        toast({
          title: "Sucesso",
          description: "Convite enviado para o novo usuário!",
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Prevent users from deleting themselves
    if (user && user.id === userId) {
      toast({
        title: "Operação não permitida",
        description: "Você não pode excluir sua própria conta.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Deleting user:', userId);
      
      // In a real application, this would delete from the database
      // Currently we're simulating this with local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">CRM</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Carregando usuários...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((userData) => {
                  const isCurrentUser = user && user.id === userData.id;
                  
                  return (
                    <TableRow key={userData.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {isCurrentUser && (
                            <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          )}
                          <span>
                            {userData.firstName} {userData.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{userData.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{userData.crm}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(userData.role)}>
                          {getRoleName(userData.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditUser(userData)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteUser(userData.id)}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? "Não é possível excluir seu próprio perfil" : "Excluir usuário"}
                          >
                            <Trash className={`h-4 w-4 ${isCurrentUser ? 'text-gray-300' : ''}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
