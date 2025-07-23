import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Users, Building2, UserCheck, AlertTriangle, Wrench } from 'lucide-react';
import { UsersTab } from '@/components/admin/dashboard/Tabs/UsersTab';
import { ClinicsTab } from '@/components/admin/dashboard/Tabs/ClinicsTab';
import { RegisterTab } from '@/components/admin/dashboard/Tabs/RegisterTab';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers, getAllClinics, getAllClinicStaff } from '@/services/admin';
import { runFullDiagnostic, cleanOrphanData } from '@/services/admin/diagnosticService';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [cleanLoading, setCleanLoading] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [clinicStaff, setClinicStaff] = useState([]);
  
  // Filter states
  const [userFilters, setUserFilters] = useState({
    name: '',
    role: '' as any,
    createdAfter: undefined,
    createdBefore: undefined
  });
  
  const [clinicFilters, setClinicFilters] = useState({
    name: '',
    city: '',
    active: undefined,
    createdAfter: undefined,
    createdBefore: undefined
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('=== LOADING ADMIN DASHBOARD DATA ===');
      
      const [usersData, clinicsData, staffData] = await Promise.all([
        getAllUsers(),
        getAllClinics(),
        getAllClinicStaff()
      ]);
      
      setUsers(usersData);
      setClinics(clinicsData);
      setClinicStaff(staffData);
      
      console.log('✅ Users loaded:', usersData?.length || 0);
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserFilterChange = (key: string, value: any) => {
    setUserFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClinicFilterChange = (key: string, value: any) => {
    setClinicFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRunDiagnostic = async () => {
    setDiagnosticLoading(true);
    try {
      console.log('🔍 Executando diagnóstico completo...');
      const success = await runFullDiagnostic();
      
      if (success) {
        toast({
          title: "Diagnóstico concluído",
          description: "Verifique o console para detalhes completos.",
        });
      } else {
        toast({
          title: "Erro no diagnóstico",
          description: "Verifique o console para mais informações.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      toast({
        title: "Erro no diagnóstico",
        description: "Erro inesperado durante o diagnóstico.",
        variant: "destructive"
      });
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleCleanOrphans = async () => {
    if (!confirm('Tem certeza que deseja limpar dados órfãos? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setCleanLoading(true);
    try {
      const success = await cleanOrphanData();
      
      if (success) {
        toast({
          title: "Limpeza concluída",
          description: "Dados órfãos foram removidos. Recarregando dados...",
        });
        await loadDashboardData(); // Recarregar dados
      } else {
        toast({
          title: "Erro na limpeza",
          description: "Verifique o console para mais informações.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro na limpeza:', error);
      toast({
        title: "Erro na limpeza",
        description: "Erro inesperado durante a limpeza.",
        variant: "destructive"
      });
    } finally {
      setCleanLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Gerencie usuários, clínicas e configurações do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRunDiagnostic}
            disabled={diagnosticLoading}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {diagnosticLoading ? 'Diagnosticando...' : 'Diagnóstico'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCleanOrphans}
            disabled={cleanLoading}
          >
            <Wrench className="h-4 w-4 mr-2" />
            {cleanLoading ? 'Limpando...' : 'Limpar Órfãos'}
          </Button>
          <Button onClick={loadDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              perfis ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clínicas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinics.length}</div>
            <p className="text-xs text-muted-foreground">
              {clinics.filter(c => c.active).length} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Total</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicStaff.length}</div>
            <p className="text-xs text-muted-foreground">
              {clinicStaff.filter(s => s.active).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Sistema</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✅</div>
            <p className="text-xs text-muted-foreground">
              Sistema operacional
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="clinics">Clínicas</TabsTrigger>
          <TabsTrigger value="register">Cadastrar</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab 
            users={users} 
            loading={loading} 
            onRefetch={loadDashboardData}
            filters={userFilters}
            onFilterChange={handleUserFilterChange}
          />
        </TabsContent>

        <TabsContent value="clinics">
          <ClinicsTab 
            clinics={clinics} 
            loading={loading} 
            onRefetch={loadDashboardData}
            filters={clinicFilters}
            onFilterChange={handleClinicFilterChange}
          />
        </TabsContent>

        <TabsContent value="register">
          <RegisterTab onSuccess={loadDashboardData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
