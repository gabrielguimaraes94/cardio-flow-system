
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicRegistrationForm } from '@/components/admin/ClinicRegistrationForm';
import { useAuth } from '@/contexts/AuthContext';
import { isGlobalAdmin } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Verificar se o usuário está autenticado e é um admin global
    const checkAdmin = async () => {
      if (!user) {
        navigate('/admin/login');
        return;
      }
      
      try {
        const isAdmin = await isGlobalAdmin(user.id);
        if (!isAdmin) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta área.",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        navigate('/admin/login');
      }
    };
    
    checkAdmin();
  }, [user, navigate, toast]);

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
                <ClinicRegistrationForm />
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
                <p className="text-muted-foreground">
                  Funcionalidade em desenvolvimento
                </p>
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
                <p className="text-muted-foreground">
                  Funcionalidade em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};
