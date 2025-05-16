
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerClinic } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Schema de validação com Zod
const formSchema = z.object({
  adminFirstName: z.string().min(1, 'Nome é obrigatório'),
  adminLastName: z.string().min(1, 'Sobrenome é obrigatório'),
  adminEmail: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  adminPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  adminCrm: z.string().optional(),
  adminPhone: z.string().optional(),
  clinicName: z.string().min(1, 'Nome da clínica é obrigatório'),
  clinicCity: z.string().min(1, 'Cidade é obrigatória'),
  clinicAddress: z.string().min(1, 'Endereço é obrigatório'),
  clinicPhone: z.string().min(1, 'Telefone é obrigatório'),
  clinicEmail: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  clinicTradingName: z.string().optional(), // Novo campo para nome fantasia
  clinicCnpj: z.string().optional(), // Novo campo para CNPJ
});

type FormData = z.infer<typeof formSchema>;

export const ClinicRegistrationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: '',
      adminCrm: '',
      adminPhone: '',
      clinicName: '',
      clinicCity: '',
      clinicAddress: '',
      clinicPhone: '',
      clinicEmail: '',
      clinicTradingName: '',
      clinicCnpj: '',
    }
  });

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await registerClinic({
        admin: {
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          email: data.adminEmail,
          password: data.adminPassword,
          crm: data.adminCrm || '',
          phone: data.adminPhone || null,
          role: 'clinic_admin', // Definido como clinic_admin, não doctor
        },
        clinic: {
          name: data.clinicName,
          city: data.clinicCity,
          address: data.clinicAddress,
          phone: data.clinicPhone,
          email: data.clinicEmail,
          tradingName: data.clinicTradingName || undefined,
          cnpj: data.clinicCnpj || undefined,
        }
      });
      
      toast({
        title: "Sucesso",
        description: "Clínica e usuário administrador criados com sucesso!",
      });
      
      form.reset();
    } catch (error) {
      console.error('Error creating clinic:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar a clínica.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Nova Clínica</CardTitle>
        <CardDescription>
          Cadastre uma nova clínica e o usuário administrador responsável.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dados da Clínica</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clinicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Clínica</FormLabel>
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
                        <Input placeholder="Nome fantasia (opcional)" {...field} />
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
                        <Input placeholder="CNPJ (opcional)" {...field} />
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
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="clinicAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clinicPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefone da clínica" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email da clínica" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dados do Administrador</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="adminFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do administrador" {...field} />
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
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Sobrenome do administrador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email do administrador" type="email" {...field} />
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
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input placeholder="Senha" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="adminCrm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="CRM (se aplicável)" {...field} />
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
                      <FormLabel>Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefone do administrador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <CardFooter className="flex justify-end p-0">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar Clínica"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
