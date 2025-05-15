
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Shield, LogIn } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isGlobalAdmin } from '@/services/adminService';

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
      if (user) {
        try {
          const isAdmin = await isGlobalAdmin(user.id);
          if (isAdmin) {
            navigate('/admin/dashboard');
          }
        } catch (error) {
          console.error('Erro ao verificar permissões:', error);
        }
      }
    };
    
    checkAdmin();
  }, [user, navigate]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        // Verificar se o usuário é um administrador global
        const isAdmin = await isGlobalAdmin(data.user.id);
        
        if (isAdmin) {
          toast({
            title: "Login bem-sucedido",
            description: "Bem-vindo ao painel administrativo.",
          });
          navigate('/admin/dashboard');
        } else {
          await supabase.auth.signOut();
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta área.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    "Entrando..."
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
