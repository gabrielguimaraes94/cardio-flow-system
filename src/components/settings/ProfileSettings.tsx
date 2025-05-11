
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, NotificationSettings } from '@/types/profile';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Schema for form validation
const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres",
  }),
  lastName: z.string().min(2, {
    message: "Sobrenome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Email inválido",
  }),
  phone: z.string().optional(),
  crm: z.string().min(4, {
    message: "CRM deve ter pelo menos 4 caracteres",
  }),
  title: z.string().optional(),
  bio: z.string().optional(),
  notificationPreferences: z.object({
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(true),
    appointmentReminders: z.boolean().default(true),
    systemUpdates: z.boolean().default(false),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      crm: "",
      title: "",
      bio: "",
      notificationPreferences: {
        emailNotifications: true,
        smsNotifications: true,
        appointmentReminders: true,
        systemUpdates: false,
      },
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            // Create a UserProfile object from the database data
            const userProfile: UserProfile = {
              id: data.id,
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: data.email || "",
              phone: data.phone || "",
              crm: data.crm || "",
              title: data.title || "",
              bio: data.bio || "",
              notificationPreferences: {
                emailNotifications: data.notification_preferences?.emailNotifications !== false,
                smsNotifications: data.notification_preferences?.smsNotifications !== false,
                appointmentReminders: data.notification_preferences?.appointmentReminders !== false,
                systemUpdates: data.notification_preferences?.systemUpdates !== false,
              },
              role: data.role as 'admin' | 'doctor' | 'staff',
            };

            setProfile(userProfile);
            
            form.reset({
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              email: userProfile.email,
              phone: userProfile.phone || "",
              crm: userProfile.crm,
              title: userProfile.title || "",
              bio: userProfile.bio || "",
              notificationPreferences: userProfile.notificationPreferences,
            });
          }
        } catch (error: any) {
          console.error("Error loading profile:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do perfil",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [user, form, toast]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar as configurações do perfil",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone,
          crm: values.crm,
          title: values.title,
          bio: values.bio,
          notification_preferences: {
            emailNotifications: values.notificationPreferences.emailNotifications,
            smsNotifications: values.notificationPreferences.smsNotifications,
            appointmentReminders: values.notificationPreferences.appointmentReminders,
            systemUpdates: values.notificationPreferences.systemUpdates,
          }
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o perfil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://avatar.vercel.sh/${form.getValues('email')}.png`} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium">Meu Perfil</h2>
              <p className="text-sm text-muted-foreground">
                Atualize suas informações de perfil e configurações de notificação.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cardio-500"></div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu sobrenome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seuemail@exemplo.com" {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 0000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="crm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CRM</FormLabel>
                        <FormControl>
                          <Input placeholder="Número do CRM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título/Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Médico Cardiologista" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escreva uma breve descrição sobre você"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <h3 className="text-lg font-medium">Notificações</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerencie suas preferências de notificação.
                  </p>

                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="notificationPreferences.emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificações por Email</FormLabel>
                            <FormDescription>
                              Receba notificações importantes por email.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notificationPreferences.smsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificações por SMS</FormLabel>
                            <FormDescription>
                              Receba notificações urgentes por SMS.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notificationPreferences.appointmentReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Lembretes de Consulta</FormLabel>
                            <FormDescription>
                              Receba lembretes de suas consultas agendadas.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notificationPreferences.systemUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Atualizações do Sistema</FormLabel>
                            <FormDescription>
                              Seja notificado sobre novas funcionalidades e atualizações do sistema.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-cardio-500 hover:bg-cardio-600">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </form>
            </Form>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
