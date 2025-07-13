import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserDialog } from './UserDialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/contexts/ClinicContext';
import { UserProfile } from '@/types/profile';

export const UserManagement = () => {
  const { user } = useAuth();
  const { selectedClinic, refetchClinics } = useClinic();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    if (!user || !selectedClinic) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          crm,
          phone,
          role,
          title,
          bio,
          created_at
        `);

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive"
        });
        return;
      }

      const formattedUsers: UserProfile[] = data?.map(user => ({
        id: user.id,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        crm: user.crm || '',
        phone: user.phone,
        role: user.role as UserProfile['role'],
        title: user.title || '',
        bio: user.bio || ''
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar usuários.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user, selectedClinic, searchTerm]);

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (userToDelete: UserProfile) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userToDelete.firstName} ${userToDelete.lastName}?`)) {
      return;
    }

    try {
      console.log('Iniciando exclusão do usuário:', userToDelete.id);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) {
        console.error('Erro ao excluir usuário:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Usuário excluído",
        description: `${userToDelete.firstName} ${userToDelete.lastName} foi excluído com sucesso.`
      });

      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir usuário.",
        variant: "destructive"
      });
    }
  };

  const handleSaveUser = async (userData: UserProfile) => {
    if (!user || !selectedClinic) {
      toast({
        title: "Erro",
        description: "Usuário ou clínica não identificados.",
        variant: "destructive"
      });
      return;
    }

    try {
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
            role: userData.role,
            title: userData.title,
            bio: userData.bio,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id);

        if (error) {
          console.error('Erro ao atualizar usuário:', error);
          throw error;
        }

        toast({
          title: "Usuário atualizado",
          description: "Informações do usuário atualizadas com sucesso!"
        });
      } else {
        // Criar novo usuário usando signup direto
        console.log('Criando novo usuário');
        
        // 1. Verificar se email já existe
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', userData.email)
          .single();

        if (existingUser) {
          toast({
            title: "Erro",
            description: "Já existe um usuário com este email.",
            variant: "destructive"
          });
          return;
        }

        // 2. Fazer signup direto - isso criará o usuário no auth.users e o trigger criará o profile
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: userData.email,
          password: 'CardioFlow2024!',
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              phone: userData.phone || '',
              crm: userData.crm,
              role: userData.role,
              title: userData.title || '',
              bio: userData.bio || ''
            }
          }
        });

        if (signUpError) {
          console.error('Erro no signup:', signUpError);
          toast({
            title: "Erro ao criar usuário",
            description: signUpError.message || "Não foi possível criar o usuário.",
            variant: "destructive"
          });
          return;
        }

        if (!signUpData.user) {
          toast({
            title: "Erro",
            description: "Usuário não foi criado corretamente.",
            variant: "destructive"
          });
          return;
        }

        console.log('Usuário criado com sucesso:', signUpData.user.id);

        // 3. Se for clinic_admin, criar uma nova clínica para ele
        if (userData.role === 'clinic_admin') {
          console.log('Criando clínica para clinic_admin');
          
          // Criar nova clínica
          const { data: clinicData, error: clinicError } = await supabase
            .from('clinics')
            .insert({
              name: `Clínica de ${userData.firstName} ${userData.lastName}`,
              address: 'Endereço a ser atualizado',
              city: 'Cidade a ser atualizada',
              phone: userData.phone || '',
              email: userData.email,
              created_by: user.id,
              active: true
            })
            .select()
            .single();

          if (clinicError) {
            console.error('Erro ao criar clínica:', clinicError);
            toast({
              title: "Aviso",
              description: "Usuário criado, mas houve erro ao criar a clínica. Você pode criar manualmente.",
              variant: "destructive"
            });
          } else {
            console.log('Clínica criada:', clinicData.id);
            
            // 4. Associar o usuário à clínica como admin
            const { error: staffError } = await supabase
              .from('clinic_staff')
              .insert({
                user_id: signUpData.user.id,
                clinic_id: clinicData.id,
                is_admin: true,
                role: 'clinic_admin',
                active: true
              });

            if (staffError) {
              console.error('Erro ao associar usuário à clínica:', staffError);
              toast({
                title: "Aviso",
                description: "Usuário e clínica criados, mas houve erro na associação.",
                variant: "destructive"
              });
            } else {
              console.log('Usuário associado à clínica com sucesso');
              // Atualizar lista de clínicas
              await refetchClinics();
            }
          }
        } else {
          // 4. Para outros roles, associar à clínica atual
          console.log('Associando usuário à clínica atual');
          const { error: staffError } = await supabase
            .from('clinic_staff')
            .insert({
              user_id: signUpData.user.id,
              clinic_id: selectedClinic.id,
              is_admin: false,
              role: userData.role,
              active: true
            });

          if (staffError) {
            console.error('Erro ao associar usuário à clínica:', staffError);
            toast({
              title: "Aviso",
              description: "Usuário criado, mas não foi possível associá-lo à clínica.",
              variant: "destructive"
            });
          }
        }

        toast({
          title: "Usuário criado",
          description: `${userData.firstName} ${userData.lastName} foi criado com sucesso!`
        });
      }

      setIsDialogOpen(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível salvar o usuário.",
        variant: "destructive"
      });
    }
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

  const getRoleName = (role: string): string => {
    const roleNames: Record<string, string> = {
      admin: 'Administrador Global',
      clinic_admin: 'Admin. Clínica',
      doctor: 'Médico',
      nurse: 'Enfermeiro',
      receptionist: 'Recepcionista',
      staff: 'Equipe',
    };
    return roleNames[role] || role;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestão de Usuários</CardTitle>
            <CardDescription>
              Gerencie os usuários cadastrados no sistema
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

        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Carregando usuários...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length > 0 ? (
              users.map((user: UserProfile) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        {getRoleName(user.role)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-1 text-sm">
                      <p><strong>CRM:</strong> {user.crm}</p>
                      {user.phone && <p><strong>Telefone:</strong> {user.phone}</p>}
                      {user.title && <p><strong>Título:</strong> {user.title}</p>}
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-gray-50 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center p-8 border rounded-md bg-gray-50">
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </div>
            )}
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
