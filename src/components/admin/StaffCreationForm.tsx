import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';

interface StaffCreationFormProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  firstName: z.string().min(2, "Nome é obrigatório"),
  lastName: z.string().min(2, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  crm: z.string().min(1, "CRM é obrigatório"),
  role: z.enum(['doctor', 'nurse', 'receptionist', 'staff', 'clinic_admin'], {
    required_error: "Cargo é obrigatório"
  }),
  title: z.string().optional(),
  bio: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

export const StaffCreationForm: React.FC<StaffCreationFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedClinic } = useClinic();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      crm: "",
      role: "doctor",
      title: "",
      bio: "",
      isAdmin: false,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !selectedClinic) {
      toast({
        title: "Erro",
        description: "Usuário ou clínica não identificados.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('=== CREATING CLINIC STAFF ===');
      
      // Preparar payload para a edge function
      const payload = {
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phone || '',
        crm: values.crm,
        role: values.role,
        title: values.title || '',
        bio: values.bio || '',
        clinic_id: selectedClinic.id,
        is_admin: values.isAdmin || values.role === 'clinic_admin'
      };

      console.log('Payload:', payload);

      // Chamar a edge function
      const { data, error } = await supabase.functions.invoke('create-clinic-staff', {
        body: payload
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message || 'Erro ao criar funcionário');
      }

      if (!data?.success) {
        console.error('❌ Creation failed:', data);
        throw new Error(data?.error || 'Falha na criação do funcionário');
      }

      console.log('✅ Staff creation successful:', data);

      toast({
        title: "Sucesso!",
        description: `${values.firstName} ${values.lastName} foi criado com sucesso! Senha padrão: CardioFlow2024!`,
      });

      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: unknown) {
      console.error("❌ Staff creation error:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Não foi possível criar o funcionário. Tente novamente.";
      
      toast({
        title: "Erro na criação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabels = {
    doctor: 'Médico',
    nurse: 'Enfermeiro',
    receptionist: 'Recepcionista',
    staff: 'Equipe',
    clinic_admin: 'Admin. Clínica'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Funcionário</CardTitle>
        <CardDescription>
          Adicione um novo funcionário à {selectedClinic?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome" {...field} />
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
                    <FormLabel>Sobrenome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(xx) xxxxx-xxxx" {...field} />
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
                    <FormLabel>CRM *</FormLabel>
                    <FormControl>
                      <Input placeholder="CRM ou registro profissional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título Profissional</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cardiologista, Enfermeira Chefe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Input placeholder="Breve descrição profissional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> O funcionário será criado com a senha padrão <code className="bg-blue-100 px-1 rounded">CardioFlow2024!</code>. 
                Ele deverá alterar a senha no primeiro acesso.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Criando funcionário..." : "Criar Funcionário"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};