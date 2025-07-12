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
  const [profiles, setProfiles] = useState<AdminUser[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [clinicStaff, setClinicStaff] = useState<ClinicStaffMember[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [userFilters, setUserFilters] = useState({
    name: '',
    role: '' as UserRole | '',
    createdAfter: undefined as string | undefined,
    createdBefore: undefined as string | undefined,
  });
  
  const [clinicFilters, setClinicFilters] = useState({
    name: '',
    city: '',
    active: undefined as boolean | undefined,
    createdAfter: undefined as string | undefined,
    createdBefore: undefined as string | undefined,
  });

  const handleUserFilterChange = (key: string, value: any) => {
    setUserFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClinicFilterChange = (key: string, value: any) => {
    setClinicFilters(prev => ({ ...prev, [key]: value }));
  };

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('=== LOADING ADMIN DASHBOARD DATA ===');

      const [profilesData, authUsersData, clinicsData, clinicStaffData] = await Promise.allSettled([
        getAllUsers(),
        debugAuthUsers(),
        getAllClinics(),
        getClinicStaffData()
      ]);

      if (profilesData.status === 'fulfilled') {
        console.log('✅ Users loaded:', profilesData.value.length);
        setProfiles(profilesData.value);
      } else {
        console.error('❌ Error loading users:', profilesData.reason);
        toast({
          title: "Erro ao carregar usuários",
          description: "Não foi possível carregar os dados dos usuários.",
          variant: "destructive",
        });
      }

      if (authUsersData.status === 'fulfilled') {
        console.log('✅ Auth users loaded:', authUsersData.value.authUsers?.length || 0);
        setAuthUsers(authUsersData.value.authUsers || []);
      } else {
        console.error('❌ Error loading auth users:', authUsersData.reason);
        toast({
          title: "Erro ao carregar usuários",
          description: "Não foi possível carregar os dados dos usuários.",
          variant: "destructive",
        });
      }

      if (clinicsData.status === 'fulfilled') {
        console.log('✅ Clinics loaded:', clinicsData.value.length);
        setClinics(clinicsData.value);
      } else {
        console.error('❌ Error loading clinics:', clinicsData.reason);
        toast({
          title: "Erro ao carregar clínicas",
          description: "Não foi possível carregar os dados das clínicas.",
          variant: "destructive",
        });
      }

      if (clinicStaffData.status === 'fulfilled') {
        console.log('✅ Clinic staff loaded:', clinicStaffData.value.clinicStaff?.length || 0);
        setClinicStaff(clinicStaffData.value.clinicStaff || []);
      } else {
        console.error('❌ Error loading clinic staff:', clinicStaffData.reason);
        toast({
          title: "Erro ao carregar equipe",
          description: "Não foi possível carregar os dados da equipe das clínicas.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ GENERAL ERROR LOADING DASHBOARD:', error);
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
      console.log('=== SYNCING MISSING PROFILES ===');
      await syncMissingProfiles();
      await loadData();
      toast({
        title: "Sincronização concluída",
        description: "Perfis ausentes foram sincronizados.",
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os perfis.",
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
        const hasAccess = await isGlobalAdmin(user.id);
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
        console.error('Error checking access:', error);
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
              Sincronizar Perfis
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
              <CardTitle className="text-sm font-medium">Membros da Equipe</CardTitle>
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
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UsersTab 
              users={profiles}
              loading={isLoading}
              onRefetch={loadData}
              filters={userFilters}
              onFilterChange={handleUserFilterChange}
            />
          </TabsContent>

          <TabsContent value="clinics" className="space-y-4">
            <ClinicsTab 
              clinics={clinics}
              loading={isLoading}
              onRefetch={loadData}
              filters={clinicFilters}
              onFilterChange={handleClinicFilterChange}
            />
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <RegisterTab onSuccess={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};