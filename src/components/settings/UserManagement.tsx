import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash, Loader2, UserCheck, UserPlus, UserSearch, AlertTriangle, Mail, Phone, User, Briefcase } from 'lucide-react';
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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Schema para busca por email
const emailSearchSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
});

// Schema para adicionar um usuário à clínica
const addToClinicSchema = z.object({
  role: z.enum(['doctor', 'nurse', 'receptionist', 'staff'], {
    required_error: "Selecione uma função",
  }),
  isAdmin: z.boolean().default(false),
});

// Schema para criar um novo usuário
const newUserSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['doctor', 'nurse', 'receptionist', 'staff'], {
    required_error: "Selecione uma função",
  }),
  phone: z.string().optional(),
  crm: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

export const UserManagement = () => {
  const { selectedClinic } = useClinic();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'search' | 'create'>('search');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [userAlreadyInClinic, setUserAlreadyInClinic] = useState(false);
  
  // Form para busca por email
  const emailSearchForm = useForm<z.infer<typeof emailSearchSchema>>({
    resolver: zodResolver(emailSearchSchema),
    defaultValues: {
      email: '',
    },
  });

  // Form para adicionar usuário existente à clínica
  const addToClinicForm = useForm<z.infer<typeof addToClinicSchema>>({
    resolver: zodResolver(addToClinicSchema),
    defaultValues: {
      role: 'doctor',
      isAdmin: false,
    },
  });

  // Form para criar novo usuário
  const newUserForm = useForm<z.infer<typeof newUserSchema>>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'doctor',
      phone: '',
      crm: '',
      isAdmin: false,
    },
  });

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
    (staff.user.crm && staff.user.crm.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleOpenAddUserDialog = () => {
    setIsAddUserDialogOpen(true);
    setCurrentTab('search');
    setSearchResult(null);
    setUserAlreadyInClinic(false);
    emailSearchForm.reset();
    newUserForm.reset();
    addToClinicForm.reset({ role: 'doctor', isAdmin: false });
  };

  const handleSearchUser = async (values: z.infer<typeof emailSearchSchema>) => {
    if (!selectedClinic) return;
    
    try {
      setIsSearching(true);
      setUserAlreadyInClinic(false);
      setSearchResult(null);
      
      // Search for user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', values.email.trim().toLowerCase())
        .maybeSingle();
      
      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }
      
      if (!userData) {
        // No user found with that email
        toast({
          title: "Usuário não encontrado",
          description: "Nenhum usuário encontrado com esse email. Você pode criar um novo usuário.",
        });
        
        // Pre-fill the new user form with the email
        newUserForm.setValue('email', values.email.trim().toLowerCase());
        setCurrentTab('create');
        return;
      }
      
      // Check if the user is already in this clinic
      const isAlreadyStaff = staffMembers.some(staff => 
        staff.user.id === userData.id
      );
      
      if (isAlreadyStaff) {
        setUserAlreadyInClinic(true);
        setSearchResult({
          id: userData.id,
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.email,
          phone: userData.phone || null,
          crm: userData.crm || '',
          title: userData.title || '',
          bio: userData.bio || '',
          role: userData.role
        });
        
        toast({
          title: "Usuário já associado",
          description: "Este usuário já está associado a esta clínica.",
          variant: "destructive",
        });
        return;
      }
      
      // User found and not in clinic yet
      setSearchResult({
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone || null,
        crm: userData.crm || '',
        title: userData.title || '',
        bio: userData.bio || '',
        role: userData.role
      });
      
      // Reset the add to clinic form
      addToClinicForm.reset({ 
        role: userData.role === 'doctor' ? 'doctor' : 
              userData.role === 'nurse' ? 'nurse' : 
              userData.role === 'receptionist' ? 'receptionist' : 'staff',
        isAdmin: false
      });
      
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
  
  const handleAddExistingUserToClinic = async (values: z.infer<typeof addToClinicSchema>) => {
    if (!searchResult || !selectedClinic) return;
    
    try {
      await addClinicStaff(selectedClinic.id, searchResult.id, values.role, values.isAdmin);
      
      // Reload staff list
      const staffData = await fetchClinicStaff(selectedClinic.id);
      setStaffMembers(staffData);
      
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso!",
      });
      
      setIsAddUserDialogOpen(false);
      setSearchResult(null);
      emailSearchForm.reset();
      
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o funcionário.",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateNewUser = async (values: z.infer<typeof newUserSchema>) => {
    if (!selectedClinic) return;
    
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', values.email.trim().toLowerCase())
        .maybeSingle();
        
      if (existingUser) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está em uso. Por favor, use a opção de buscar usuário existente.",
          variant: "destructive",
        });
        
        // Switch to search tab and pre-fill the email
        setCurrentTab('search');
        emailSearchForm.setValue('email', values.email);
        return;
      }
      
      // Gerar senha aleatória segura
      const generatePassword = () => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+';
        
        const getRandomChar = (str: string) => str[Math.floor(Math.random() * str.length)];
        
        let password = '';
        // Pelo menos um de cada categoria
        password += getRandomChar(lowercase);
        password += getRandomChar(uppercase);
        password += getRandomChar(numbers);
        password += getRandomChar(symbols);
        
        // Completa até 10 caracteres
        for (let i = 0; i < 6; i++) {
          const allChars = lowercase + uppercase + numbers + symbols;
          password += getRandomChar(allChars);
        }
        
        // Embaralha a senha
        return password.split('').sort(() => 0.5 - Math.random()).join('');
      };
      
      const password = generatePassword();
      
      // Create the user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            first_name: values.firstName.trim(),
            last_name: values.lastName.trim(),
          },
        },
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }
      
      // Update the profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone?.trim() || null,
          crm: values.crm?.trim() || '',
          role: values.role
        })
        .eq('id', authData.user.id);
        
      if (profileError) throw profileError;
      
      // Associate with the clinic
      await addClinicStaff(selectedClinic.id, authData.user.id, values.role, values.isAdmin);
      
      // Reload staff list
      const staffData = await fetchClinicStaff(selectedClinic.id);
      setStaffMembers(staffData);
      
      toast({
        title: "Sucesso",
        description: "Novo funcionário criado e associado à clínica!",
      });
      
      setIsAddUserDialogOpen(false);
      newUserForm.reset();
      
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o usuário.",
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
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName.trim(),
          last_name: userData.lastName.trim(),
          email: userData.email.trim().toLowerCase(),
          crm: userData.crm?.trim() || '',
          phone: userData.phone?.trim() || null,
          title: userData.title?.trim() || '',
          bio: userData.bio?.trim() || '',
          role: userData.role
        })
        .eq('id', userData.id);
      
      if (error) throw error;
      
      // Update the local staff list
      setStaffMembers(staffMembers.map(staff => 
        staff.user.id === userData.id 
          ? { ...staff, user: userData } 
          : staff
      ));
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!user) return;
    
    try {
      const success = await removeClinicStaff(staffId, user.id);
      
      if (success) {
        // Update the local staff list
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
            <Button 
              onClick={handleOpenAddUserDialog} 
              disabled={!selectedClinic}
              className="bg-cardio-500 hover:bg-cardio-600"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Funcionário
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar funcionários por nome, email ou CRM..."
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
                <TableHead className="hidden sm:table-cell">Perfil</TableHead>
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
                    {selectedClinic 
                      ? searchTerm 
                        ? 'Nenhum funcionário encontrado com esses termos de busca' 
                        : 'Nenhum funcionário cadastrado nesta clínica'
                      : 'Selecione uma clínica para ver seus funcionários'}
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
                            <UserCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          )}
                          <span>
                            {staffMember.user.firstName} {staffMember.user.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{staffMember.user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{staffMember.user.crm || '-'}</TableCell>
                      <TableCell className="hidden sm:table-cell">
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={isCurrentUser}
                                title={isCurrentUser ? "Não é possível remover seu próprio perfil" : "Remover funcionário"}
                              >
                                <Trash className={`h-4 w-4 ${isCurrentUser ? 'text-gray-300' : 'text-red-500'}`} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover funcionário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover {staffMember.user.firstName} {staffMember.user.lastName} desta clínica?
                                  <br /><br />
                                  Esta ação não exclui o usuário do sistema, apenas remove seu acesso a esta clínica.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-500 hover:bg-red-600" 
                                  onClick={() => handleRemoveStaff(staffMember.id)}
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
      
      {/* Dialog para editar usuário existente */}
      <UserDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSave={handleSaveUser} 
        user={currentUser} 
      />
      
      {/* Dialog para adicionar usuário com tabs para busca e criação */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Funcionário à Clínica</DialogTitle>
            <DialogDescription>
              Busque um usuário existente por email ou cadastre um novo.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'search' | 'create')} className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <UserSearch className="h-4 w-4" />
                <span>Buscar Existente</span>
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Criar Novo</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="pt-4 space-y-6">
              <Form {...emailSearchForm}>
                <form onSubmit={emailSearchForm.handleSubmit(handleSearchUser)} className="space-y-4">
                  <FormField
                    control={emailSearchForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email do Funcionário</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <div className="relative flex-1">
                              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="email@exemplo.com" className="pl-8" {...field} />
                            </div>
                            <Button 
                              type="submit" 
                              disabled={isSearching || !emailSearchForm.formState.isValid}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              
              {/* Resultado da busca por usuário */}
              {userAlreadyInClinic && (
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md space-y-2">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Usuário já associado</h3>
                      <p className="text-sm text-yellow-700">
                        O usuário <span className="font-medium">{searchResult?.firstName} {searchResult?.lastName}</span> já 
                        está associado a esta clínica.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {searchResult && !userAlreadyInClinic && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-start">
                      <UserCheck className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-green-800 mb-1">Usuário Encontrado</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Nome:</p>
                              <p className="text-sm font-medium">{searchResult.firstName} {searchResult.lastName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Email:</p>
                              <p className="text-sm font-medium">{searchResult.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Função no Sistema:</p>
                              <Badge variant="outline" className={getRoleColor(searchResult.role)}>
                                {getRoleName(searchResult.role)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Telefone:</p>
                              <p className="text-sm font-medium">{searchResult.phone || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Associar à Clínica</h3>
                    <Form {...addToClinicForm}>
                      <form onSubmit={addToClinicForm.handleSubmit(handleAddExistingUserToClinic)} className="space-y-4">
                        <FormField
                          control={addToClinicForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Função na Clínica</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma função" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="doctor">Médico</SelectItem>
                                  <SelectItem value="nurse">Enfermeiro</SelectItem>
                                  <SelectItem value="receptionist">Recepção</SelectItem>
                                  <SelectItem value="staff">Equipe</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addToClinicForm.control}
                          name="isAdmin"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Administrador da Clínica
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Pode gerenciar funcionários, configurações e dados desta clínica
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end mt-6">
                          <Button 
                            type="submit" 
                            className="bg-cardio-500 hover:bg-cardio-600"
                          >
                            Associar à Clínica
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="create" className="pt-4">
              <Form {...newUserForm}>
                <form onSubmit={newUserForm.handleSubmit(handleCreateNewUser)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={newUserForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newUserForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="Sobrenome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={newUserForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="email@exemplo.com" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={newUserForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone (opcional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="(00) 00000-0000" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newUserForm.control}
                      name="crm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRM (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="CRM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={newUserForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Função no Sistema
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma função" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="doctor">Médico</SelectItem>
                              <SelectItem value="nurse">Enfermeiro</SelectItem>
                              <SelectItem value="receptionist">Recepção</SelectItem>
                              <SelectItem value="staff">Equipe</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={newUserForm.control}
                    name="isAdmin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Administrador da Clínica
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Pode gerenciar funcionários, configurações e dados desta clínica
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      type="submit" 
                      className="bg-cardio-500 hover:bg-cardio-600"
                    >
                      Criar & Associar
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
