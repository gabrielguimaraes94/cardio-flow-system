import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  isGlobalAdmin, 
  getAllClinicsAdmin,
  getAllUsersAdmin, 
  AdminClinic, 
  AdminUser
} from '@/services/admin';
import { getAllProfilesAdmin, ProfileData } from '@/services/admin/profileService';
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
import { syncMissingProfilesAdmin, debugAuthUsersAdmin, getClinicStaffDataAdmin } from '@/services/admin/debugUserService';
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
  is_admin: boolean;
  active: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
  };
  clinics?: {
    name: string;
    city: string;
  };
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [clinicStaff, setClinicStaff] = useState<ClinicStaffMember[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('=== CARREGANDO DADOS DO DASHBOARD ADMIN ===');

      const [profilesData, authUsersData, clinicsData, clinicStaffData] = await Promise.allSettled([
        getAllProfilesAdmin(),
        debugAuthUsersAdmin(),
        getAllClinicsAdmin(),
        getClinicStaffDataAdmin()
      ]);

      if (profilesData.status === 'fulfilled') {
        console.log('✅ Profiles carregados:', profilesData.value.length);
        setProfiles(profilesData.value);
      } else {
        console.error('❌ Erro ao carregar profiles:', profilesData.reason);
        toast({
          title: "Erro ao carregar profiles",
          description: "Não foi possível carregar os dados dos profiles.",
          variant: "destructive",
        });
      }

      if (authUsersData.status === 'fulfilled') {
        console.log('✅ Auth users carregados:', authUsersData.value.length);
        setAuthUsers(authUsersData.value);
      } else {
        console.error('❌ Erro ao carregar auth users:', authUsersData.reason);
        toast({
          title: "Erro ao carregar usuários",
          description: "Não foi possível carregar os dados dos usuários.",
          variant: "destructive",
        });
      }

      if (clinicsData.status === 'fulfilled') {
        console.log('✅ Clínicas carregadas:', clinicsData.value.length);
        setClinics(clinicsData.value);
      } else {
        console.error('❌ Erro ao carregar clínicas:', clinicsData.reason);
        toast({
          title: "Erro ao carregar clínicas",
          description: "Não foi possível carregar os dados das clínicas.",
          variant: "destructive",
        });
      }

      if (clinicStaffData.status === 'fulfilled') {
        console.log('✅ Clinic staff carregado:', clinicStaffData.value.length);
        setClinicStaff(clinicStaffData.value);
      } else {
        console.error('❌ Erro ao carregar clinic staff:', clinicStaffData.reason);
        toast({
          title: "Erro ao carregar funcionários",
          description: "Não foi possível carregar os dados dos funcionários das clínicas.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ ERRO GERAL AO CARREGAR DASHBOARD:', error);
      toast({
        title: "Erro no dashboard",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    toast({
      title: "Dados atualizados",
      description: "Dashboard atualizado com sucesso.",
    });
  };

  const handleSyncMissingProfiles = async () => {
    try {
      console.log('=== SINCRONIZANDO PROFILES FALTANTES ===');
      await syncMissingProfilesAdmin();
      await loadData();
      toast({
        title: "Sincronização completa",
        description: "Profiles faltantes foram sincronizados.",
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os profiles.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/admin/login');
        return;
      }

      try {
        const hasAccess = await isGlobalAdmin();
        if (!hasAccess) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar o dashboard administrativo.",
            variant: "destructive",
          });
          navigate('/no-access');
          return;
        }

        await loadData();
      } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        toast({
          title: "Erro de acesso",
          description: "Não foi possível verificar suas permissões.",
          variant: "destructive",
        });
        navigate('/no-access');
      }
    };

    checkAccess();
  }, [user, navigate, toast]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando dashboard...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">
              Gerencie usuários, clínicas e configurações do sistema
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleSyncMissingProfiles}
              variant="outline"
              size="sm"
            >
              <Users className="h-4 w-4 mr-2" />
              Sincronizar Profiles
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{authUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                {profiles.length} com perfil completo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clínicas Ativas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clinics.filter(c => c.active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {clinics.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clinicStaff.filter(cs => cs.active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {clinicStaff.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins de Clínica</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clinicStaff.filter(cs => cs.is_admin && cs.active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                administradores ativos
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="clinics">Clínicas</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UsersTab 
              profiles={profiles}
              authUsers={authUsers}
              clinicStaff={clinicStaff}
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="clinics" className="space-y-4">
            <ClinicsTab 
              clinics={clinics}
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <RegisterTab onRefresh={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};