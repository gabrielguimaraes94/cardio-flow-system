
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RegisterForm } from './RegisterForm';

// Esquema de validação com zod
const schema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof schema>;

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      console.log('=== INICIANDO LOGIN ===');
      console.log('Email:', data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) throw error;
      
      if (authData.session) {
        console.log('=== LOGIN BEM-SUCEDIDO ===');
        console.log('User ID:', authData.user?.id);
        
        // ✅ NOVO: Verificar primeiro login antes de redirecionar
        try {
          // Verificar se é admin global primeiro
          const { data: isAdmin, error: adminError } = await supabase.rpc('is_global_admin', {
            user_uuid: authData.user!.id
          });

          if (adminError) {
            console.error('Erro ao verificar admin global:', adminError);
          } else if (isAdmin) {
            console.log('Usuário é admin global, pulando verificação de primeiro login');
          } else {
            // Só verificar primeiro login se não for admin global
            const { data: firstLoginData, error: firstLoginError } = await supabase.rpc('is_user_first_login', {
              user_uuid: authData.user!.id
            });
            
            if (firstLoginError) {
              console.error('Erro ao verificar primeiro login:', firstLoginError);
            } else {
              console.log('É primeiro login?', firstLoginData);
              
              if (firstLoginData) {
                toast({
                  title: "Primeiro acesso detectado",
                  description: "Você será redirecionado para alterar sua senha.",
                });
                
                // Redirecionar para página de primeiro login
                navigate('/first-login', { replace: true });
                return;
              }
            }
          }
        } catch (firstLoginError) {
          console.error('Erro ao verificar primeiro login:', firstLoginError);
        }
        
        // ✅ NOVO: Verificar clínicas antes de redirecionar
        try {
          console.log('=== VERIFICANDO CLÍNICAS DO USUÁRIO ===');
          
          const { data: clinicsData, error: clinicsError } = await supabase.rpc('get_user_clinics', {
            user_uuid: authData.user!.id
          });
          
          if (clinicsError) {
            console.error('Erro ao buscar clínicas:', clinicsError);
            throw clinicsError;
          }
          
          console.log('Clínicas encontradas:', clinicsData);
          console.log('Quantidade de clínicas:', clinicsData?.length || 0);
          
          toast({
            title: "Login realizado com sucesso!",
            description: "Redirecionando...",
          });
          
          // ✅ CORREÇÃO: Redirecionar baseado nas clínicas encontradas
          if (!clinicsData || clinicsData.length === 0) {
            console.log('Usuário sem clínicas, redirecionando para no-access');
            navigate('/no-access', { replace: true });
          } else if (clinicsData.length === 1) {
            console.log('Usuário tem uma clínica, redirecionando para dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('Usuário tem múltiplas clínicas, redirecionando para seleção');
            navigate('/clinic-selection', { replace: true });
          }
          
        } catch (clinicsError) {
          console.error('Erro ao verificar clínicas:', clinicsError);
          toast({
            title: "Erro ao verificar acesso",
            description: "Erro ao verificar suas clínicas. Tente novamente.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Erro de login:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setShowRegisterForm(!showRegisterForm);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (showRegisterForm) {
    return <RegisterForm onToggleForm={toggleForm} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 heartbeat-bg">
      <Card className="w-full max-w-md shadow-lg card-shadow animate-fade-in">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center p-2 bg-cardio-500 rounded-lg">
              <Heart className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">CardioFlow</h2>
          <p className="text-sm text-gray-500">
            Sistema de Gestão para Clínicas de Cardiologia
          </p>
        </CardHeader>
        <form onSubmit={form.handleSubmit(handleLogin)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email" 
                placeholder="seu-email@exemplo.com"
                aria-invalid={!!form.formState.errors.email}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-xs text-cardio-500 hover:underline">
                  Esqueceu sua senha?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register('password')}
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
              {form.formState.errors.password && (
                <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full bg-cardio-500 hover:bg-cardio-600" 
              disabled={isLoading}
            >
              {isLoading ? 'Verificando acesso...' : 'Entrar'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full" 
              onClick={toggleForm}
            >
              Não tem uma conta? Cadastre-se
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
