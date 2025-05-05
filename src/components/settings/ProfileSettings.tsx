
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface ProfileFormValues {
  name: string;
  email: string;
  role: string;
  title: string;
  bio: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  systemUpdates: boolean;
}

export const ProfileSettings: React.FC = () => {
  const { toast } = useToast();
  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      name: 'Dr. Carlos Silva',
      email: 'carlos.silva@cardio.com',
      role: 'Médico Cardiologista',
      title: 'CRM 12345',
      bio: 'Especialista em cardiologia intervencionista com mais de 10 anos de experiência.'
    }
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    systemUpdates: false
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    console.log('Profile data:', data);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso."
    });
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    console.log('Password data:', data);
    
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', {
        type: 'manual',
        message: 'As senhas não coincidem'
      });
      return;
    }
    
    toast({
      title: "Senha atualizada",
      description: "Sua senha foi atualizada com sucesso."
    });
    
    passwordForm.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Tabs defaultValue="general">
      <TabsList className="mb-4">
        <TabsTrigger value="general">Informações Gerais</TabsTrigger>
        <TabsTrigger value="password">Senha</TabsTrigger>
        <TabsTrigger value="notifications">Notificações</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e profissionais.
            </CardDescription>
          </CardHeader>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" {...profileForm.register('name', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...profileForm.register('email', { required: true })} readOnly />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Input id="role" {...profileForm.register('role')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Título/Registro</Label>
                  <Input id="title" {...profileForm.register('title')} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Input id="bio" {...profileForm.register('bio')} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Salvar Alterações</Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Atualize sua senha para manter sua conta segura.
            </CardDescription>
          </CardHeader>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  {...passwordForm.register('currentPassword', { required: 'Senha atual é obrigatória' })} 
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  {...passwordForm.register('newPassword', { 
                    required: 'Nova senha é obrigatória',
                    minLength: { value: 8, message: 'A senha deve ter pelo menos 8 caracteres' }
                  })} 
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  {...passwordForm.register('confirmPassword', { 
                    required: 'Confirmação de senha é obrigatória',
                    validate: value => value === passwordForm.watch('newPassword') || 'As senhas não coincidem'
                  })} 
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Atualizar Senha</Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Notificação</CardTitle>
            <CardDescription>
              Configure como e quando você deseja receber notificações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por email.
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotifications">Notificações por SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas via mensagem de texto.
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appointmentReminders">Lembretes de Consulta</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes de consultas e procedimentos agendados.
                  </p>
                </div>
                <Switch
                  id="appointmentReminders"
                  checked={notificationSettings.appointmentReminders}
                  onCheckedChange={(checked) => handleNotificationChange('appointmentReminders', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="systemUpdates">Atualizações do Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado sobre novas funcionalidades e atualizações.
                  </p>
                </div>
                <Switch
                  id="systemUpdates"
                  checked={notificationSettings.systemUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('systemUpdates', checked)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => {
              toast({
                title: "Preferências atualizadas",
                description: "Suas preferências de notificação foram salvas."
              });
            }}>
              Salvar Preferências
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
