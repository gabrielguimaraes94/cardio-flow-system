
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Shield, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isGlobalAdmin } from '@/services/admin';

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor insira um email válido.",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
});

export const AdminLogin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  useEffect(() => {
    // Verificar se o usuário já está logado e é um admin global
    const checkAdmin = async () => {
      if (user && !adminChecked) {
        setCheckingAdmin(true);
        try {
          console.log('AdminLogin: Verificando admin para usuário:', user.id);
          const isAdmin = await isGlobalAdmin(user.id);
          console.log('AdminLogin: Resultado verificação admin:', isAdmin);
          
          if (isAdmin) {
            console.log('AdminLogin: Usuário já é admin, redirecionando para dashboard');
            toast({
              title: "Acesso administrativo",
              description: "Você já está logado como administrador.",
            });
            navigate('/admin/dashboard');
          } else {
            console.log('AdminLogin: Usuário não é admin');
            setCheckingAdmin(false);
          }
          setAdminChecked(true);
        } catch (error) {
          console.error('AdminLogin: Erro ao verificar permissões:', error);
          setCheckingAdmin(false);
          setAdminChecked(true);
        }
      }
    };
    
    checkAdmin();
  }, [user, navigate, toast, adminChecked]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('AdminLogin: Tentando fazer login com:', values.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        console.log('AdminLogin: Login realizado, verificando permissões admin');
        setCheckingAdmin(true);
        
        // Aguardar um pouco para garantir que o profile foi criado
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o usuário é um administrador global
        const isAdmin = await isGlobalAdmin(data.user.id);
        console.log('AdminLogin: Verificação admin após login:', isAdmin);
        
        if (isAdmin) {
          console.log('AdminLogin: Usuário é admin, redirecionando para dashboard');
          toast({
            title: "Login bem-sucedido",
            description: "Bem-vindo ao painel administrativo.",
          });
          navigate('/admin/dashboard');
        } else {
          console.log('AdminLogin: Usuário não é admin, fazendo logout');
          await supabase.auth.signOut();
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta área.",
            variant: "destructive",
          });
          setCheckingAdmin(false);
        }
      }
    } catch (error: any) {
      console.error('AdminLogin: Erro no processo de login:', error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas. Por favor, tente novamente.",
        variant: "destructive",
      });
      setCheckingAdmin(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Administração</CardTitle>
            <CardDescription>
              Acesso restrito para administradores do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@cardioflow.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={form.formState.isSubmitting || checkingAdmin}
                >
                  {form.formState.isSubmitting || checkingAdmin ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
