
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { 
  isGlobalAdmin, 
  getAllClinics, 
  getAllUsers, 
  AdminClinic, 
  AdminUser
} from '@/services/adminService';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { RegisterTab } from '@/components/admin/dashboard/Tabs/RegisterTab';
import { ClinicsTab } from '@/components/admin/dashboard/Tabs/ClinicsTab';
import { UsersTab } from '@/components/admin/dashboard/Tabs/UsersTab';

type UserRole = Database["public"]["Enums"]["user_role"];

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
      // Here we ensure we're passing the correct role type or undefined
      const filters = {
        ...userFilters,
        role: userFilters.role === '' ? undefined : userFilters.role
      };
      const data = await getAllUsers(filters);
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
            <RegisterTab onSuccess={fetchData} />
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
        </Tabs>
      </div>
    </AdminLayout>
  );
};
