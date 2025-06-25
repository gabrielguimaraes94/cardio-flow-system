
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  isGlobalAdmin, 
  getAllClinics, 
  getAllUsers, 
  AdminClinic, 
  AdminUser
} from '@/services/admin';
import { getAllProfiles, ProfileData } from '@/services/admin/profileService';
import { ProfilesTable } from '@/components/admin/dashboard/ProfilesTable';
import { AuthUsersTable } from '@/components/admin/dashboard/AuthUsersTable';
import { ClinicStaffTable } from '@/components/admin/dashboard/ClinicStaffTable';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, RefreshCw } from 'lucide-react';
import { RegisterTab } from '@/components/admin/dashboard/Tabs/RegisterTab';
import { ClinicsTab } from '@/components/admin/dashboard/Tabs/ClinicsTab';
import { UsersTab } from '@/components/admin/dashboard/Tabs/UsersTab';
import { Button } from '@/components/ui/button';
import { syncMissingProfiles, debugAuthUsers, getClinicStaffData } from '@/services/admin/debugUserService';
import { checkTriggerStatus, testTriggerExecution } from '@/services/admin/triggerService';

type UserRole = Database["public"]["Enums"]["user_role"];

interface AuthUser {
  auth_user_id: string;
  auth_email: string;
  auth_created_at: string;
  has_profile: boolean;
}

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

export const AdminDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [adminChecked, setAdminChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Estado para dados
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [clinicStaff, setClinicStaff] = useState<ClinicStaffMember[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingAuthUsers, setLoadingAuthUsers] = useState(false);
  const [loadingClinicStaff, setLoadingClinicStaff] = useState(false);
  
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
    role: '' as UserRole | '',
    createdAfter: undefined as string | undefined,
    createdBefore: undefined as string | undefined
  });
  
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
          console.log('Admin verificado, carregando dados iniciais...');
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
    console.log('=== CARREGANDO DADOS INICIAIS ===');
    await Promise.all([
      fetchClinics(),
      fetchUsers(),
      fetchProfiles(),
      fetchAuthUsers(),
      fetchClinicStaff()
    ]);
  };
  
  const fetchClinics = async () => {
    try {
      setLoadingClinics(true);
      console.log('Buscando clínicas...');
      const data = await getAllClinics(clinicFilters);
      console.log('Clínicas carregadas:', data.length);
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
      console.log('=== DASHBOARD: INICIANDO BUSCA DE USUÁRIOS ===');
      
      // Garantir que estamos passando os filtros corretos
      const filters = {
        ...userFilters,
        role: userFilters.role === '' ? undefined : userFilters.role
      };
      
      const data = await getAllUsers(filters);
      console.log('=== DASHBOARD: RESULTADO DA BUSCA ===');
      console.log('Dados retornados por getAllUsers:', data);
      
      setUsers(data);
    } catch (error) {
      console.error('❌ DASHBOARD: Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao buscar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const fetchProfiles = async () => {
    try {
      setLoadingProfiles(true);
      console.log('=== DASHBOARD: INICIANDO BUSCA DE PROFILES ===');
      
      const data = await getAllProfiles();
      console.log('=== DASHBOARD: RESULTADO DA BUSCA DE PROFILES ===');
      console.log('Dados retornados por getAllProfiles:', data);
      
      setProfiles(data);
    } catch (error) {
      console.error('❌ DASHBOARD: Erro ao buscar profiles:', error);
      toast({
        title: "Erro ao buscar profiles",
        description: "Não foi possível carregar a lista de profiles.",
        variant: "destructive",
      });
    } finally {
      setLoadingProfiles(false);
    }
  };

  const fetchAuthUsers = async () => {
    try {
      setLoadingAuthUsers(true);
      console.log('=== DASHBOARD: INICIANDO BUSCA DE AUTH USERS ===');
      
      const { authUsers: data, error } = await debugAuthUsers();
      
      if (error) {
        throw error;
      }
      
      console.log('=== DASHBOARD: RESULTADO DA BUSCA DE AUTH USERS ===');
      console.log('Dados retornados:', data);
      
      setAuthUsers(data);
    } catch (error) {
      console.error('❌ DASHBOARD: Erro ao buscar auth users:', error);
      toast({
        title: "Erro ao buscar usuários auth",
        description: "Não foi possível carregar a lista de usuários de autenticação.",
        variant: "destructive",
      });
    } finally {
      setLoadingAuthUsers(false);
    }
  };

  const fetchClinicStaff = async () => {
    try {
      setLoadingClinicStaff(true);
      console.log('=== DASHBOARD: INICIANDO BUSCA DE CLINIC STAFF ===');
      
      const { clinicStaff: data, error } = await getClinicStaffData();
      
      if (error) {
        throw error;
      }
      
      console.log('=== DASHBOARD: RESULTADO DA BUSCA DE CLINIC STAFF ===');
      console.log('Dados retornados:', data);
      
      setClinicStaff(data);
    } catch (error) {
      console.error('❌ DASHBOARD: Erro ao buscar clinic staff:', error);
      toast({
        title: "Erro ao buscar equipe",
        description: "Não foi possível carregar a lista de equipe das clínicas.",
        variant: "destructive",
      });
    } finally {
      setLoadingClinicStaff(false);
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

  // Nova função para lidar com sucesso no cadastro de clínica
  const handleClinicRegistrationSuccess = async () => {
    console.log('Clínica cadastrada com sucesso, trocando para aba de gerenciar clínicas');
    await fetchData(); // Recarregar dados
    setActiveTab('clinics'); // Trocar para aba de gerenciar clínicas
    toast({
      title: "Clínica cadastrada!",
      description: "A clínica foi cadastrada com sucesso. Agora você pode visualizá-la na lista.",
    });
  };

  const handleSyncProfiles = async () => {
    try {
      setIsSyncing(true);
      console.log('=== INICIANDO SINCRONIZAÇÃO DE PROFILES ===');
      
      const result = await syncMissingProfiles();
      
      if (result && result.length > 0) {
        toast({
          title: "Sincronização concluída!",
          description: `${result.length} profiles foram criados com sucesso.`,
        });
      } else {
        toast({
          title: "Sincronização concluída",
          description: "Nenhum profile precisou ser sincronizado.",
        });
      }
      
      // Recarregar dados após sincronização
      await fetchData();
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Ocorreu um erro ao sincronizar os profiles. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCheckTrigger = async () => {
    console.log('=== VERIFICANDO TRIGGER HANDLE_NEW_USER ===');
    const isWorking = await checkTriggerStatus();
    
    if (isWorking) {
      toast({
        title: "Trigger funcionando!",
        description: "O trigger handle_new_user está ativo e funcionando corretamente.",
      });
    } else {
      toast({
        title: "Problema no trigger",
        description: "O trigger handle_new_user pode estar com problemas. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    }
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciamento global do sistema CardioFlow
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleCheckTrigger}
              variant="outline"
              className="bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Trigger
            </Button>
            <Button 
              onClick={handleSyncProfiles}
              disabled={isSyncing}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sincronizar Profiles
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-6">
            <TabsTrigger value="register">Cadastrar Nova Clínica</TabsTrigger>
            <TabsTrigger value="clinics">Gerenciar Clínicas</TabsTrigger>
            <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
            <TabsTrigger value="profiles">Análise Completa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register">
            <RegisterTab onSuccess={handleClinicRegistrationSuccess} />
          </TabsContent>
          
          <TabsContent value="clinics">
            <ClinicsTab
              clinics={clinics}
              loading={loadingClinics}
              onRefetch={fetchClinics}
              filters={clinicFilters}
              onFilterChange={handleClinicFilterChange}
            />
          </TabsContent>
          
          <TabsContent value="users">
            <UsersTab
              users={users}
              loading={loadingUsers}
              onRefetch={fetchUsers}
              filters={userFilters}
              onFilterChange={handleUserFilterChange}
            />
          </TabsContent>
          
          <TabsContent value="profiles">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise Completa do Sistema</CardTitle>
                  <CardDescription>
                    Visualização detalhada de todas as tabelas relacionadas aos usuários
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <div className="space-y-6">
                <ProfilesTable
                  profiles={profiles}
                  loading={loadingProfiles}
                />
                
                <AuthUsersTable
                  authUsers={authUsers}
                  loading={loadingAuthUsers}
                />
                
                <ClinicStaffTable
                  clinicStaff={clinicStaff}
                  loading={loadingClinicStaff}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};
