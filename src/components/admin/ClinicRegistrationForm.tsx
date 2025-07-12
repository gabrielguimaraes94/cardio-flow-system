
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { registerClinic } from '@/services/admin';

interface ClinicRegistrationFormProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  adminFirstName: z.string().min(2, "Nome é obrigatório"),
  adminLastName: z.string().min(2, "Sobrenome é obrigatório"),
  adminEmail: z.string().email("Email inválido"),
  adminPhone: z.string().optional(),
  adminCrm: z.string().optional(),
  clinicName: z.string().min(2, "Nome da clínica é obrigatório"),
  clinicCity: z.string().min(2, "Cidade é obrigatória"),
  clinicAddress: z.string().min(5, "Endereço é obrigatório"),
  clinicPhone: z.string().min(8, "Telefone é obrigatório"),
  clinicEmail: z.string().email("Email inválido"),
  clinicTradingName: z.string().optional(),
  clinicCnpj: z.string().optional(),
});

export const ClinicRegistrationForm: React.FC<ClinicRegistrationFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPhone: "",
      adminCrm: "",
      clinicName: "",
      clinicCity: "",
      clinicAddress: "",
      clinicPhone: "",
      clinicEmail: "",
      clinicTradingName: "",
      clinicCnpj: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Verificar se o usuário atual é admin global
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        throw new Error('Apenas administradores globais podem registrar clínicas');
      }

      console.log('=== REGISTERING NEW CLINIC ===');
      console.log('Clinic data:', {
        name: values.clinicName,
        city: values.clinicCity,
        address: values.clinicAddress,
        phone: values.clinicPhone,
        email: values.clinicEmail,
        trading_name: values.clinicTradingName,
        cnpj: values.clinicCnpj
      });

      // 1. Registrar clínica primeiro
      const clinicData = {
        name: values.clinicName,
        city: values.clinicCity,
        address: values.clinicAddress,
        phone: values.clinicPhone,
        email: values.clinicEmail,
        trading_name: values.clinicTradingName,
        cnpj: values.clinicCnpj,
      };

      const result = await registerClinic(clinicData, user.id);
      
      let clinicId: string;
      if (typeof result === 'string') {
        clinicId = result;
      } else if (result && typeof result === 'object' && 'id' in result) {
        clinicId = (result as { id: string }).id;
      } else {
        console.log('Clinic registration result:', JSON.stringify(result));
        throw new Error('Unable to determine clinic ID from result');
      }

      console.log('✅ Clinic registered successfully:', { id: clinicId });

      // 2. Criar admin da clínica
      console.log('=== CREATING ADMIN USER ===');
      console.log('Admin data:', {
        email: values.adminEmail,
        first_name: values.adminFirstName,
        last_name: values.adminLastName,
        role: 'clinic_admin'
      });

      // Fazer signup do admin
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.adminEmail,
        password: 'CardioFlow2024!',
        options: {
          data: {
            first_name: values.adminFirstName,
            last_name: values.adminLastName,
            phone: values.adminPhone || '',
            crm: values.adminCrm || '',
            role: 'clinic_admin',
            title: '',
            bio: ''
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw new Error(`Erro ao criar usuário admin: ${signUpError.message}`);
      }

      if (!signUpData.user) {
        throw new Error('Falha ao criar usuário admin - sem dados do usuário');
      }

      console.log('✅ Admin user created:', signUpData.user.id);

      // 3. Aguardar um pouco para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Associar o usuário à clínica
      console.log('=== ASSOCIATING USER TO CLINIC ===');
      const { error: staffError } = await supabase
        .from('clinic_staff')
        .insert({
          user_id: signUpData.user.id,
          clinic_id: clinicId,
          is_admin: true,
          role: 'clinic_admin',
          active: true
        });

      if (staffError) {
        console.error('Error associating user to clinic:', staffError);
        // Não falhar o processo todo, apenas avisar
        console.log('User created but not associated to clinic');
      } else {
        console.log('✅ User associated to clinic successfully');
      }

      toast({
        title: "Clínica registrada com sucesso!",
        description: "A clínica e o administrador foram registrados no sistema.",
      });

      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error("Error registering clinic:", error);
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Não foi possível registrar a clínica. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Dados do Administrador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="adminFirstName"
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
              name="adminLastName"
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
              name="adminEmail"
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
              name="adminPhone"
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
              name="adminCrm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CRM</FormLabel>
                  <FormControl>
                    <Input placeholder="CRM (se aplicável)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Dados da Clínica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clinicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Clínica *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da clínica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicTradingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome fantasia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicCnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="XX.XXX.XXX/XXXX-XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço *</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input placeholder="(xx) xxxxx-xxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="clinic@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> O administrador da clínica será criado com a senha padrão <code className="bg-blue-100 px-1 rounded">CardioFlow2024!</code>. 
            Ele deverá alterar a senha no primeiro acesso.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrar Clínica"}
        </Button>
      </form>
    </Form>
  );
};
