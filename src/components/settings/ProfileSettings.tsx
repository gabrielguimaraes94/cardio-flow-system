
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '@/schemas/profileSchema';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      crm: "",
      title: "",
      bio: "",
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true);
        try {
          console.log('Loading profile for user:', user.id);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error loading profile:', error);
            throw error;
          }

          console.log('Profile data loaded:', data);

          if (data) {
            const userProfile: UserProfile = {
              id: data.id,
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: data.email || "",
              phone: data.phone || "",
              crm: data.crm || "",
              title: data.title || "",
              bio: data.bio || "",
              role: data.role as 'admin' | 'doctor' | 'nurse' | 'receptionist',
            };

            setProfile(userProfile);
            
            // Reset form with loaded data
            const formData: ProfileFormData = {
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              email: userProfile.email,
              phone: userProfile.phone || "",
              crm: userProfile.crm,
              title: userProfile.title || "",
              bio: userProfile.bio || "",
            };
            
            console.log('Resetting form with data:', formData);
            reset(formData);
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
  }, [user, reset, toast]);

  const onSubmit = async (values: ProfileFormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar as configurações do perfil",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Saving profile data:', values);

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone || null,
          crm: values.crm,
          title: values.title || null,
          bio: values.bio || null,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving profile:', error);
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
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://avatar.vercel.sh/${profile?.email || 'user'}.png`} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium">Meu Perfil</h2>
              <p className="text-sm text-muted-foreground">
                Atualize suas informações de perfil.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cardio-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome *</Label>
                  <Input
                    id="firstName"
                    placeholder="Seu nome"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome *</Label>
                  <Input
                    id="lastName"
                    placeholder="Seu sobrenome"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 0000-0000"
                    {...register('phone')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crm">CRM *</Label>
                  <Input
                    id="crm"
                    placeholder="Número do CRM"
                    {...register('crm')}
                    className={errors.crm ? 'border-red-500' : ''}
                  />
                  {errors.crm && (
                    <p className="text-sm text-red-600">{errors.crm.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título/Cargo</Label>
                <Input
                  id="title"
                  placeholder="Ex: Médico Cardiologista"
                  {...register('title')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Escreva uma breve descrição sobre você"
                  className="resize-none"
                  {...register('bio')}
                />
              </div>

              <Button 
                type="submit" 
                className="bg-cardio-500 hover:bg-cardio-600"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
