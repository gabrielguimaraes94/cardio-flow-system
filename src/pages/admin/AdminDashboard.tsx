
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicRegistrationForm } from '@/components/admin/ClinicRegistrationForm';
import { useAuth } from '@/contexts/AuthContext';
import { 
  isGlobalAdmin, 
  getAllClinics, 
  getAllUsers, 
  AdminClinic, 
  AdminUser,
  updateClinicStatus,
  deleteClinic
} from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Filter, Trash, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AdminDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [adminChecked, setAdminChecked] = useState(false);
  
  // Estado para dados
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Estado para filtros
  const [clinicFilters, setClinicFilters] = useState({
    name: '',
    city: '',
    active: undefined as boolean | undefined,
    createdAfter: undefined as string | undefined,
    createdBefore: undefined as string | undefined
  });
  
  const [userFilters, setUserFilters] = useState({
    name: '',
    role: '',
    createdAfter: undefined as string | undefined,
    createdBefore: undefined as string | undefined
  });
  
  // Estado para modais
  const [showClinicFilters, setShowClinicFilters] = useState(false);
  const [showUserFilters, setShowUserFilters] = useState(false);
  const [confirmDeleteClinic, setConfirmDeleteClinic] = useState<string | null>(null);
  const [confirmStatusChange, setConfirmStatusChange] = useState<{id: string, active: boolean} | null>(null);
  
  useEffect(() => {
    // Verificar se o usuário está autenticado e é um admin global
    const checkAdmin = async () => {
      if (authLoading) return;
      
      if (!user) {
        console.log("AdminDashboard: No user, redirecting to login");
        navigate('/admin/login');
        return;
      }
      
      if (adminChecked) return;
      
      try {
        console.log('Verificando admin no dashboard:', user.id);
        const isAdmin = await isGlobalAdmin(user.id);
        console.log('Resultado verificação admin:', isAdmin);
        
        if (!isAdmin) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta área.",
            variant: "destructive",
          });
          navigate('/');
        } else {
          setIsLoading(false);
          await fetchData(); // Carregar dados iniciais
        }
        setAdminChecked(true);
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        toast({
          title: "Erro ao verificar permissões",
          description: "Ocorreu um erro ao verificar suas permissões. Tente novamente mais tarde.",
          variant: "destructive",
        });
        navigate('/admin/login');
      }
    };
    
    checkAdmin();
  }, [user, authLoading, navigate, toast, adminChecked]);
  
  // Função para buscar dados
  const fetchData = async () => {
    await Promise.all([
      fetchClinics(),
      fetchUsers()
    ]);
  };
  
  const fetchClinics = async () => {
    try {
      setLoadingClinics(true);
      const data = await getAllClinics(clinicFilters);
      setClinics(data);
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      toast({
        title: "Erro ao buscar clínicas",
        description: "Não foi possível carregar a lista de clínicas.",
        variant: "destructive",
      });
    } finally {
      setLoadingClinics(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getAllUsers(userFilters);
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao buscar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Manipuladores de eventos
  const handleClinicFilterChange = (key: string, value: any) => {
    setClinicFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleUserFilterChange = (key: string, value: any) => {
    setUserFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const applyClinicFilters = () => {
    setShowClinicFilters(false);
    fetchClinics();
  };
  
  const clearClinicFilters = () => {
    setClinicFilters({
      name: '',
      city: '',
      active: undefined,
      createdAfter: undefined,
      createdBefore: undefined
    });
    setShowClinicFilters(false);
  };
  
  const applyUserFilters = () => {
    setShowUserFilters(false);
    fetchUsers();
  };
  
  const clearUserFilters = () => {
    setUserFilters({
      name: '',
      role: '',
      createdAfter: undefined,
      createdBefore: undefined
    });
    setShowUserFilters(false);
  };
  
  const handleClinicStatusChange = async () => {
    if (!confirmStatusChange) return;
    
    try {
      await updateClinicStatus(confirmStatusChange.id, confirmStatusChange.active);
      toast({
        title: "Status atualizado",
        description: `Clínica ${confirmStatusChange.active ? 'ativada' : 'desativada'} com sucesso.`,
      });
      fetchClinics();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível alterar o status da clínica.",
        variant: "destructive",
      });
    } finally {
      setConfirmStatusChange(null);
    }
  };
  
  const handleDeleteClinic = async () => {
    if (!confirmDeleteClinic) return;
    
    try {
      await deleteClinic(confirmDeleteClinic);
      toast({
        title: "Clínica excluída",
        description: "A clínica foi excluída com sucesso.",
      });
      fetchClinics();
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a clínica.",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteClinic(null);
    }
  };
  
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
    return roleColors[role] || '';
  };

  if (isLoading || authLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Verificando permissões...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento global do sistema CardioFlow
          </p>
        </div>
        
        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-6">
            <TabsTrigger value="register">Cadastrar Nova Clínica</TabsTrigger>
            <TabsTrigger value="clinics">Gerenciar Clínicas</TabsTrigger>
            <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Nova Clínica</CardTitle>
                <CardDescription>
                  Registre uma nova clínica e seu administrador no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClinicRegistrationForm onSuccess={fetchData} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="clinics">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Clínicas</CardTitle>
                <CardDescription>
                  Visualize e gerencie todas as clínicas cadastradas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome da clínica..."
                      className="pl-8"
                      value={clinicFilters.name}
                      onChange={(e) => handleClinicFilterChange('name', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchClinics()}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowClinicFilters(true)}
                    className="ml-2"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingClinics ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span>Carregando clínicas...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : clinics.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                            Nenhuma clínica encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        clinics.map((clinic) => (
                          <TableRow key={clinic.id}>
                            <TableCell className="font-medium">{clinic.name}</TableCell>
                            <TableCell>{clinic.city}</TableCell>
                            <TableCell>{clinic.email}</TableCell>
                            <TableCell>{clinic.phone}</TableCell>
                            <TableCell>
                              <Badge variant={clinic.active ? "outline" : "secondary"} className={clinic.active ? "bg-green-100 text-green-800" : ""}>
                                {clinic.active ? "Ativa" : "Inativa"}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(clinic.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setConfirmStatusChange({ id: clinic.id, active: !clinic.active })}
                                >
                                  {clinic.active ? "Desativar" : "Ativar"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setConfirmDeleteClinic(clinic.id)}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Usuários</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome do usuário..."
                      className="pl-8"
                      value={userFilters.name}
                      onChange={(e) => handleUserFilterChange('name', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUserFilters(true)}
                    className="ml-2"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>CRM</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Criado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span>Carregando usuários...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getRoleColor(user.role)}>
                                {getRoleName(user.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.crm}</TableCell>
                            <TableCell>{user.phone || "-"}</TableCell>
                            <TableCell>{formatDate(user.created_at)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal de filtros para Clínicas */}
      <Dialog open={showClinicFilters} onOpenChange={setShowClinicFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Clínicas</DialogTitle>
            <DialogDescription>
              Aplique filtros para refinar a lista de clínicas exibidas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input
                  placeholder="Filtrar por nome"
                  value={clinicFilters.name}
                  onChange={(e) => handleClinicFilterChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Cidade</label>
                <Input
                  placeholder="Filtrar por cidade"
                  value={clinicFilters.city}
                  onChange={(e) => handleClinicFilterChange('city', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select 
                  value={clinicFilters.active?.toString() || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      handleClinicFilterChange('active', undefined);
                    } else {
                      handleClinicFilterChange('active', value === "true");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Ativas</SelectItem>
                    <SelectItem value="false">Inativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Criado após</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {clinicFilters.createdAfter 
                          ? format(new Date(clinicFilters.createdAfter), 'dd/MM/yyyy')
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={clinicFilters.createdAfter ? new Date(clinicFilters.createdAfter) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleClinicFilterChange('createdAfter', date.toISOString());
                          } else {
                            handleClinicFilterChange('createdAfter', undefined);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Criado antes</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {clinicFilters.createdBefore 
                          ? format(new Date(clinicFilters.createdBefore), 'dd/MM/yyyy')
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={clinicFilters.createdBefore ? new Date(clinicFilters.createdBefore) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleClinicFilterChange('createdBefore', date.toISOString());
                          } else {
                            handleClinicFilterChange('createdBefore', undefined);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={clearClinicFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={applyClinicFilters}>
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de filtros para Usuários */}
      <Dialog open={showUserFilters} onOpenChange={setShowUserFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Usuários</DialogTitle>
            <DialogDescription>
              Aplique filtros para refinar a lista de usuários exibidos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input
                  placeholder="Filtrar por nome"
                  value={userFilters.name}
                  onChange={(e) => handleUserFilterChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Perfil</label>
                <Select 
                  value={userFilters.role || "all"}
                  onValueChange={(value) => {
                    handleUserFilterChange('role', value === "all" ? '' : value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os perfis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="admin">Administrador Global</SelectItem>
                    <SelectItem value="clinic_admin">Admin. Clínica</SelectItem>
                    <SelectItem value="doctor">Médico</SelectItem>
                    <SelectItem value="nurse">Enfermeiro</SelectItem>
                    <SelectItem value="receptionist">Recepção</SelectItem>
                    <SelectItem value="staff">Equipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Criado após</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {userFilters.createdAfter 
                          ? format(new Date(userFilters.createdAfter), 'dd/MM/yyyy')
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={userFilters.createdAfter ? new Date(userFilters.createdAfter) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleUserFilterChange('createdAfter', date.toISOString());
                          } else {
                            handleUserFilterChange('createdAfter', undefined);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Criado antes</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {userFilters.createdBefore 
                          ? format(new Date(userFilters.createdBefore), 'dd/MM/yyyy')
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={userFilters.createdBefore ? new Date(userFilters.createdBefore) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleUserFilterChange('createdBefore', date.toISOString());
                          } else {
                            handleUserFilterChange('createdBefore', undefined);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={clearUserFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={applyUserFilters}>
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação para excluir clínica */}
      <Dialog open={!!confirmDeleteClinic} onOpenChange={() => setConfirmDeleteClinic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação de Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteClinic(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteClinic}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação para alterar status */}
      <Dialog open={!!confirmStatusChange} onOpenChange={() => setConfirmStatusChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Alteração de Status</DialogTitle>
            <DialogDescription>
              {confirmStatusChange?.active 
                ? "Você tem certeza que deseja ativar esta clínica?" 
                : "Você tem certeza que deseja desativar esta clínica?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmStatusChange(null)}>
              Cancelar
            </Button>
            <Button onClick={handleClinicStatusChange}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
