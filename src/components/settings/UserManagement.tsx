import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserDialog } from './UserDialog';
import { UserProfile } from '@/types/profile';
import { fetchClinicStaff, addClinicStaff, removeClinicStaff, checkUserIsClinicAdmin } from '@/services/user/clinicStaffService';
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
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  // Verificar se o usuário atual é admin da clínica
  const checkIfCurrentUserIsAdmin = useCallback(async () => {
    if (!selectedClinic?.id || !user?.id) {
      setCurrentUserIsAdmin(false);
      return;
    }

    try {
      const isAdmin = await checkUserIsClinicAdmin(user.id, selectedClinic.id);
      setCurrentUserIsAdmin(isAdmin);
      console.log('Usuário atual é admin?', isAdmin);
    } catch (error) {
      console.error('Erro ao verificar se usuário é admin:', error);
      setCurrentUserIsAdmin(false);
    }
  }, [selectedClinic?.id, user?.id]);

  // Função para carregar funcionários com useCallback para evitar re-renders
  const loadStaff = useCallback(async () => {
    if (!selectedClinic?.id) {
      console.log('Nenhuma clínica selecionada');
      return;
    }

    console.log('=== CARREGANDO FUNCIONÁRIOS DA CLÍNICA ===');
    console.log('selectedClinic mudou:', selectedClinic.id);

    setIsLoading(true);
    try {
      console.log('=== CARREGANDO STAFF ===');
      console.log('Clínica selecionada:', selectedClinic.id);
      
      const staffData = await fetchClinicStaff(selectedClinic.id);
      console.log('Staff carregado da API:', staffData);
      console.log('Quantidade de funcionários encontrados:', staffData.length);
      
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

  // Carregar funcionários e verificar permissões quando a clínica mudar
  useEffect(() => {
    loadStaff();
    checkIfCurrentUserIsAdmin();
  }, [loadStaff, checkIfCurrentUserIsAdmin]);

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
      
      await loadStaff();
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
    if (!currentUserIsAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem criar usuários",
        variant: "destructive"
      });
      return;
    }
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

    // Verificar se o usuário atual pode criar usuários
    if (!currentUser && !currentUserIsAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem criar usuários",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('=== SALVANDO USUÁRIO ===');
      console.log('userData:', userData);

      if (currentUser) {
        // Editar usuário existente
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
        // ✅ NOVO: Criar usuário completo
        console.log('Criando novo usuário completo');
        
        // 1. Verificar se email já existe
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

        // 2. Criar usuário usando Edge Function com autenticação completa
        const { data: createResult, error: createError } = await supabase.functions.invoke('create-complete-user', {
          body: {
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone || '',
            crm: userData.crm,
            role: userData.role,
            title: userData.title || '',
            bio: userData.bio || '',
            clinic_id: selectedClinic.id,
            is_admin: false
          }
        });

        if (createError) throw createError;
        if (!createResult?.success) throw new Error('Falha ao criar usuário');

        toast({
          title: "Usuário criado",
          description: "Usuário criado com sucesso! Senha padrão: CardioFlow2024!"
        });
      }

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

    // Verificar se o usuário atual é admin
    if (!currentUserIsAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem remover funcionários",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('=== INICIANDO REMOÇÃO DE FUNCIONÁRIO ===');
      console.log('Staff a ser removido:', staffMember);
      console.log('Usuário que está removendo:', user.id);

      const result = await removeClinicStaff(staffMember.id, user.id);
      
      if (result.success) {
        toast({
          title: "Funcionário removido",
          description: result.message
        });
        
        await loadStaff();
      } else {
        toast({
          title: "Erro",
          description: result.message,
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
              {currentUserIsAdmin && (
                <span className="block text-sm text-green-600 mt-1">
                  ✓ Você tem permissões de administrador nesta clínica
                </span>
              )}
            </CardDescription>
          </div>
          {currentUserIsAdmin && (
            <Button onClick={handleCreateNewUser}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Buscar usuário existente */}
        {currentUserIsAdmin && (
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
        )}

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
            {filteredStaff.map((staffMember) => {
              const isCurrentUser = staffMember.user.id === user?.id;
              const canRemove = currentUserIsAdmin && !isCurrentUser;
              
              return (
                <div key={staffMember.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">
                          {staffMember.user.firstName} {staffMember.user.lastName}
                          {isCurrentUser && (
                            <span className="text-sm text-blue-600 ml-2">(Você)</span>
                          )}
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
                    {currentUserIsAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(staffMember)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveUser(staffMember)}
                      className={canRemove ? "text-red-600 hover:text-red-700" : "text-gray-400 cursor-not-allowed"}
                      disabled={!canRemove}
                      title={
                        !currentUserIsAdmin 
                          ? "Apenas administradores podem remover funcionários"
                          : isCurrentUser 
                          ? "Você não pode remover a si mesmo"
                          : "Remover funcionário"
                      }
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
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
