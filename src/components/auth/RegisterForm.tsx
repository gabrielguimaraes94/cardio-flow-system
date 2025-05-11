
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Esquema de validação com yup
const schema = yup.object({
  firstName: yup.string().required('Nome é obrigatório'),
  lastName: yup.string().required('Sobrenome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  crm: yup.string().required('CRM é obrigatório'),
  phone: yup.string(),
  password: yup.string()
    .required('Senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
});

type RegisterFormData = yup.InferType<typeof schema>;

interface RegisterFormProps {
  onToggleForm: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // 1. Registrar o usuário no supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // 2. Atualizar o perfil com os dados adicionais
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            crm: data.crm,
            phone: data.phone || null,
            role: 'admin',
          })
          .eq('id', authData.user.id);

        if (updateError) throw new Error(updateError.message);

        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar seu cadastro.",
        });

        // Retornar para o formulário de login
        onToggleForm();
      }
    } catch (error) {
      console.error("Erro ao registrar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            Cadastro de Médico
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Seu nome"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Seu sobrenome"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="seu-email@exemplo.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crm">CRM</Label>
                <Input
                  id="crm"
                  {...register('crm')}
                  placeholder="Seu CRM"
                />
                {errors.crm && (
                  <p className="text-xs text-red-500">{errors.crm.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(00) 00000-0000"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full bg-cardio-500 hover:bg-cardio-600" 
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full" 
              onClick={onToggleForm}
            >
              Já tem uma conta? Faça login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
