
import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash, Loader2, UserCheck, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserDialog } from './UserDialog';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchUsers, 
  fetchClinicStaff,
  checkUserExists,
  addClinicStaff,
  removeClinicStaff
} from '@/services/userService';
import { UserProfile } from '@/types/profile';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

export const UserManagement = () => {
  const { selectedClinic } = useClinic();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchCrm, setSearchCrm] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [isAdmin, setIsAdmin] = useState(false);

  // Buscar funcionários da clínica selecionada
  useEffect(() => {
    const loadStaff = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!selectedClinic?.id) {
          setStaffMembers([]);
          setIsLoading(false);
          return;
        }
        
        console.log('Loading staff for clinic:', selectedClinic?.id);
        
        const staffData = await fetchClinicStaff(selectedClinic.id);
        setStaffMembers(staffData);
        
      } catch (error) {
        console.error('Failed to load staff:', error);
        setError('Falha ao carregar funcionários');
        toast({
          title: "Erro",
          description: "Não foi possível carregar os funcionários.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStaff();
  }, [selectedClinic, toast]);

  // Listen for clinic change events
  useEffect(() => {
    const handleClinicChange = () => {
      setSearchTerm('');
    };

    window.addEventListener('clinicChanged', handleClinicChange);
    return () => {
      window.removeEventListener('clinicChanged', handleClinicChange);
    };
  }, []);

  const filteredStaff = staffMembers.filter(staff => 
    `${staff.user.firstName} ${staff.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    staff.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.user.crm.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAddExisting = () => {
    setSearchEmail('');
    setSearchCrm('');
    setSearchResult(null);
    setSelectedRole('doctor');
    setIsAdmin(false);
    setIsAddExistingOpen(true);
  };

  const handleSearchUser = async () => {
    if (!searchEmail && !searchCrm) {
      toast({
        title: "Erro de validação",
        description: "Informe email ou CRM para buscar um usuário existente.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSearching(true);
      const existingUser = await checkUserExists(searchEmail, searchCrm);
      setSearchResult(existingUser);
      
      if (!existingUser) {
        toast({
          title: "Usuário não encontrado",
          description: "Nenhum usuário encontrado com esse email/CRM.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast({
        title: "Erro",
        description: "Falha ao buscar usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddStaffMember = async () => {
    if (!searchResult || !selectedClinic) return;
    
    try {
      // Verificar se o usuário já está associado a esta clínica
      const isAlreadyStaff = staffMembers.some(staff => 
        staff.user.id === searchResult.id
      );
      
      if (isAlreadyStaff) {
        toast({
          title: "Usuário já associado",
          description: "Este usuário já está associado a esta clínica.",
          variant: "destructive",
        });
        return;
      }
      
      await addClinicStaff(selectedClinic.id, searchResult.id, selectedRole, isAdmin);
      
      // Recarregar lista de funcionários
      const staffData = await fetchClinicStaff(selectedClinic.id);
      setStaffMembers(staffData);
      
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso!",
      });
      
      setIsAddExistingOpen(false);
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o funcionário.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (staffMember: any) => {
    setCurrentUser(staffMember.user);
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
        
        // Atualizar na lista local
        setStaffMembers(staffMembers.map(staff => 
          staff.user.id === userData.id 
            ? { ...staff, user: userData } 
            : staff
        ));
        
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        });
      } else {
        // Add new user (via auth signup) e depois associar à clínica
        if (!selectedClinic) {
          toast({
            title: "Erro",
            description: "Nenhuma clínica selecionada.",
            variant: "destructive",
          });
          return;
        }
        
        // Verificar se o usuário já existe
        const existingUser = await checkUserExists(userData.email, userData.crm);
        
        if (existingUser) {
          toast({
            title: "Usuário já existe",
            description: "Um usuário com este email/CRM já existe. Use a opção 'Adicionar Existente'.",
            variant: "destructive",
          });
          return;
        }
        
        // Criar um usuário no Auth (feito geralmente pelo admin)
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(10).slice(-2).toUpperCase() + "!";
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: password,
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
            },
          },
        });
        
        if (authError) throw authError;
        
        if (authData.user) {
          // Atualizar perfil com os dados completos
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              first_name: userData.firstName,
              last_name: userData.lastName,
              crm: userData.crm,
              phone: userData.phone || null,
              title: userData.title || '',
              bio: userData.bio || '',
              role: userData.role
            })
            .eq('id', authData.user.id);
            
          if (profileError) throw profileError;
          
          // Associar à clínica
          await addClinicStaff(
            selectedClinic.id, 
            authData.user.id, 
            userData.role, 
            userData.role === 'admin' || userData.role === 'clinic_admin'
          );
          
          // Recarregar lista de funcionários
          const staffData = await fetchClinicStaff(selectedClinic.id);
          setStaffMembers(staffData);
          
          toast({
            title: "Sucesso",
            description: "Novo funcionário criado e senha temporária enviada!",
          });
        }
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

  const handleRemoveStaff = async (staffId: string) => {
    if (!user) return;
    
    try {
      const success = await removeClinicStaff(staffId, user.id);
      
      if (success) {
        // Atualizar a lista local removendo o funcionário
        setStaffMembers(staffMembers.filter(staff => staff.id !== staffId));
        
        toast({
          title: "Sucesso",
          description: "Funcionário removido com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: "Você não tem permissão para remover este funcionário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing staff:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o funcionário.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Gestão de Funcionários</CardTitle>
            <CardDescription>
              {selectedClinic 
                ? `Gerenciando funcionários da clínica: ${selectedClinic.name}` 
                : 'Gerencie os funcionários da clínica e suas permissões.'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Funcionário
            </Button>
            <Button variant="outline" onClick={handleAddExisting}>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Existente
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar funcionários..."
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
                <TableHead>Cargo na Clínica</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Carregando funcionários...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {selectedClinic ? 'Nenhum funcionário encontrado' : 'Selecione uma clínica para ver seus funcionários'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staffMember) => {
                  const isCurrentUser = user && user.id === staffMember.user.id;
                  
                  return (
                    <TableRow key={staffMember.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {isCurrentUser && (
                            <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          )}
                          <span>
                            {staffMember.user.firstName} {staffMember.user.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{staffMember.user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{staffMember.user.crm}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(staffMember.user.role)}>
                          {getRoleName(staffMember.user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={staffMember.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                          {staffMember.isAdmin ? 'Administrador' : 'Funcionário'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditUser(staffMember)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveStaff(staffMember.id)}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? "Não é possível remover seu próprio perfil" : "Remover funcionário"}
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
      
      {/* Dialog para adicionar usuário existente */}
      <Dialog open={isAddExistingOpen} onOpenChange={setIsAddExistingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Funcionário Existente</DialogTitle>
            <DialogDescription>
              Busque um usuário existente no sistema pelo email ou CRM.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email"
                placeholder="Email do funcionário"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="crm" className="text-sm font-medium">CRM</label>
              <Input 
                id="crm"
                placeholder="CRM do funcionário"
                value={searchCrm}
                onChange={(e) => setSearchCrm(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSearchUser} 
                disabled={isSearching || (!searchEmail && !searchCrm)}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Buscando...
                  </>
                ) : (
                  'Buscar'
                )}
              </Button>
            </div>
            
            {searchResult && (
              <div className="space-y-4 border rounded-md p-4 mt-4">
                <h4 className="font-medium">Usuário Encontrado</h4>
                <div className="space-y-2">
                  <p><strong>Nome:</strong> {searchResult.firstName} {searchResult.lastName}</p>
                  <p><strong>Email:</strong> {searchResult.email}</p>
                  <p><strong>CRM:</strong> {searchResult.crm}</p>
                  <p><strong>Função no Sistema:</strong> {getRoleName(searchResult.role)}</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">Cargo na Clínica</label>
                  <select 
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="doctor">Médico</option>
                    <option value="nurse">Enfermeiro</option>
                    <option value="receptionist">Recepção</option>
                    <option value="staff">Equipe</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="is_admin"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                  <label htmlFor="is_admin" className="text-sm font-medium">Administrador da Clínica</label>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExistingOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleAddStaffMember} 
              disabled={!searchResult}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
