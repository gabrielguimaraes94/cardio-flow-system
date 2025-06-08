
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserDialog } from './UserDialog';
import { UserProfile } from '@/types/profile';
import { fetchClinicStaff, checkUserExists, addClinicStaff, removeClinicStaff } from '@/services/userService';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ClinicStaff {
  id: string;
  user: UserProfile;
  role: string;
  isAdmin: boolean;
}

export const UserManagement = () => {
  const { selectedClinic } = useClinic();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [staff, setStaff] = useState<ClinicStaff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<ClinicStaff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);

  // Função para carregar funcionários com useCallback para evitar re-renders
  const loadStaff = useCallback(async () => {
    if (!selectedClinic?.id) {
      console.log('Nenhuma clínica selecionada');
      return;
    }

    console.log('=== USEEFFECT LOADSTAFF ===');
    console.log('selectedClinic mudou:', selectedClinic.id);

    setIsLoading(true);
    try {
      console.log('=== CARREGANDO STAFF ===');
      console.log('Clínica selecionada:', selectedClinic.id);
      
      const staffData = await fetchClinicStaff(selectedClinic.id);
      console.log('Staff carregado:', staffData);
      setStaff(staffData);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar funcionários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedClinic?.id, toast]);

  // Carregar funcionários quando a clínica mudar
  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Filtrar funcionários por termo de busca
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredStaff(staff);
      return;
    }
    
    const filtered = staff.filter(staffMember => 
      staffMember.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.user.crm.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredStaff(filtered);
  }, [searchTerm, staff]);

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email para buscar",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      console.log('=== SEARCHING USER ===');
      console.log('Email sendo buscado:', searchEmail);
      
      // Buscar usuário por email na tabela profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', searchEmail.trim())
        .single();
      
      console.log('Resultado da busca:', data);
      console.log('Erro da busca:', error);
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          crm: data.crm,
          title: data.title || '',
          bio: data.bio || '',
          role: data.role
        };
        
        console.log('Usuário encontrado:', userProfile);
        setFoundUser(userProfile);
        
        toast({
          title: "Usuário encontrado",
          description: `${userProfile.firstName} ${userProfile.lastName} encontrado!`
        });
      } else {
        console.log('Nenhum usuário encontrado com o email:', searchEmail);
        setFoundUser(null);
        toast({
          title: "Usuário não encontrado",
          description: "Nenhum usuário encontrado com este email. Você pode criar um novo usuário.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar usuário",
        variant: "destructive"
      });
      setFoundUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFoundUser = async () => {
    if (!foundUser || !selectedClinic?.id || !user?.id) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para adicionar usuário",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar se o usuário já é funcionário desta clínica
      const isAlreadyStaff = staff.some(s => s.user.id === foundUser.id);
      if (isAlreadyStaff) {
        toast({
          title: "Usuário já é funcionário",
          description: "Este usuário já é funcionário desta clínica",
          variant: "destructive"
        });
        return;
      }

      await addClinicStaff(selectedClinic.id, foundUser.id, 'doctor', false);
      
      toast({
        title: "Funcionário adicionado",
        description: "Usuário adicionado como funcionário com sucesso!"
      });
      
      // Recarregar lista
      await loadStaff();
      
      // Limpar busca
      setSearchEmail('');
      setFoundUser(null);
      
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar funcionário",
        variant: "destructive"
      });
    }
  };

  const handleCreateNewUser = () => {
    setCurrentUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (staffMember: ClinicStaff) => {
    setCurrentUser(staffMember.user);
    setIsDialogOpen(true);
  };

  const handleSaveUser = async (userData: UserProfile) => {
    if (!selectedClinic?.id || !user?.id) {
      toast({
        title: "Erro", 
        description: "Clínica não selecionada ou usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('=== SALVANDO USUÁRIO ===');
      console.log('userData:', userData);
      console.log('currentUser:', currentUser);

      if (currentUser) {
        // Editando usuário existente - apenas atualizar perfil
        console.log('Editando usuário existente');
        
        const { error } = await supabase
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

        toast({
          title: "Usuário atualizado",
          description: "Informações do usuário atualizadas com sucesso!"
        });
      } else {
        // Criando novo usuário
        console.log('Criando novo usuário');
        
        // Verificar se email já existe
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', userData.email)
          .single();

        if (existingUser) {
          toast({
            title: "Email já existe",
            description: "Já existe um usuário com este email",
            variant: "destructive"
          });
          return;
        }

        // Criar usuário no Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: '123456temp', // Senha temporária
          email_confirm: true,
          user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Atualizar perfil criado automaticamente pelo trigger
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              first_name: userData.firstName,
              last_name: userData.lastName,
              crm: userData.crm,
              phone: userData.phone,
              title: userData.title,
              bio: userData.bio,
              role: userData.role
            })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;

          // Adicionar como funcionário da clínica
          await addClinicStaff(selectedClinic.id, authData.user.id, 'doctor', false);

          toast({
            title: "Usuário criado",
            description: "Usuário criado e adicionado como funcionário!"
          });
        }
      }

      // Recarregar lista e fechar modal
      await loadStaff();
      setIsDialogOpen(false);
      setCurrentUser(null);

    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar usuário",
        variant: "destructive"
      });
    }
  };

  const handleRemoveUser = async (staffMember: ClinicStaff) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await removeClinicStaff(staffMember.id, user.id);
      
      if (success) {
        toast({
          title: "Funcionário removido",
          description: "Funcionário removido da clínica com sucesso!"
        });
        
        // Recarregar lista
        await loadStaff();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível remover o funcionário",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover funcionário",
        variant: "destructive"
      });
    }
  };

  if (!selectedClinic) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Selecione uma clínica para gerenciar usuários.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestão de Usuários</CardTitle>
            <CardDescription>
              Gerencie os funcionários da clínica {selectedClinic.name}.
            </CardDescription>
          </div>
          <Button onClick={handleCreateNewUser}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Buscar usuário existente */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-3">Adicionar Usuário Existente</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o email do usuário..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
            />
            <Button onClick={handleSearchUser} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
          
          {foundUser && (
            <div className="mt-3 p-3 bg-white border rounded flex justify-between items-center">
              <div>
                <p className="font-medium">{foundUser.firstName} {foundUser.lastName}</p>
                <p className="text-sm text-gray-600">{foundUser.email}</p>
                <p className="text-sm text-gray-600">CRM: {foundUser.crm}</p>
              </div>
              <Button onClick={handleAddFoundUser} size="sm">
                <UserCheck className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          )}
        </div>

        {/* Filtro de funcionários */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar funcionários..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de funcionários */}
        {isLoading ? (
          <div className="text-center py-8">
            <p>Carregando funcionários...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {staff.length === 0 ? 'Nenhum funcionário cadastrado' : 'Nenhum funcionário encontrado'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStaff.map((staffMember) => (
              <div key={staffMember.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">
                        {staffMember.user.firstName} {staffMember.user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{staffMember.user.email}</p>
                      {staffMember.user.crm && (
                        <p className="text-sm text-muted-foreground">CRM: {staffMember.user.crm}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{staffMember.role}</Badge>
                      {staffMember.isAdmin && <Badge variant="default">Admin</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(staffMember)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveUser(staffMember)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setCurrentUser(null);
        }}
        onSave={handleSaveUser}
        user={currentUser}
      />
    </Card>
  );
};
