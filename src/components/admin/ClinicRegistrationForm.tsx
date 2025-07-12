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
  adminPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
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
      adminPassword: "",
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
      
      // ✅ CORRIGIDO: Usar admin.createUser em vez de signUp para não fazer login automático
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.adminEmail,
        password: values.adminPassword,
        email_confirm: true,
        user_metadata: {
          first_name: values.adminFirstName,
          last_name: values.adminLastName,
          phone: values.adminPhone,
          crm: values.adminCrm,
          role: 'clinic_admin'
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // ✅ Profile será criado automaticamente pela trigger handle_new_user
      // com role e is_first_login corretos baseados no metadata

      const clinicData = {
        name: values.clinicName,
        city: values.clinicCity,
        address: values.clinicAddress,
        phone: values.clinicPhone,
        email: values.clinicEmail,
        trading_name: values.clinicTradingName,
        cnpj: values.clinicCnpj,
      };

      const result = await registerClinic(clinicData, authData.user.id);
      
      let clinicId: string;
      if (typeof result === 'string') {
        clinicId = result;
      } else if (result && typeof result === 'object' && 'id' in result) {
        clinicId = (result as { id: string }).id;
      } else {
        console.log('Clinic registration result:', JSON.stringify(result));
        throw new Error('Unable to determine clinic ID from result');
      }

      const { error: staffError } = await supabase.rpc('add_clinic_staff', {
        p_user_id: authData.user.id,
        p_clinic_id: clinicId,
        p_is_admin: true,
        p_role: 'clinic_admin'
      });

      if (staffError) {
        console.error('Error adding staff:', staffError);
        throw staffError;
      }

      toast({
        title: "Clinic registered successfully!",
        description: "The clinic and administrator have been registered in the system.",
      });

      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error("Error registering clinic:", error);
      toast({
        title: "Registration error",
        description: error instanceof Error ? error.message : "Unable to register clinic. Please try again.",
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
          <h3 className="text-lg font-medium">Administrator Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="adminFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
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
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
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
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
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
                  <FormLabel>Phone</FormLabel>
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
                    <Input placeholder="CRM (if applicable)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Clinic Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clinicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Clinic name" {...field} />
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
                  <FormLabel>Trading Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Trading name" {...field} />
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
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
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
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="Complete address" {...field} />
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
                  <FormLabel>Phone *</FormLabel>
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
                    <Input type="email" placeholder="clinic@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register Clinic"}
        </Button>
      </form>
    </Form>
  );
};