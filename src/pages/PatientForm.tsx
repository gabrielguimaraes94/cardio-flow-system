
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { patientService, patientSchema, patientAddressSchema } from '@/services/patientService';
import { supabase } from '@/integrations/supabase/client';

// Schema completo para o formulário (paciente + endereço)
const formSchema = z.object({
  // Dados do paciente
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  birthdate: z.date({ required_error: 'Data de nascimento é obrigatória' }),
  gender: z.string().min(1, { message: 'Gênero é obrigatório' }),
  cpf: z.string().min(1, { message: 'CPF é obrigatório' }),
  rg: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email({ message: 'Email inválido' }).nullable().optional(),
  
  // Campos de endereço
  cep: z.string().min(1, { message: 'CEP é obrigatório' }),
  street: z.string().min(1, { message: 'Endereço é obrigatório' }),
  number: z.string().min(1, { message: 'Número é obrigatório' }),
  complement: z.string().nullable().optional(),
  neighborhood: z.string().min(1, { message: 'Bairro é obrigatório' }),
  city: z.string().min(1, { message: 'Cidade é obrigatória' }),
  state: z.string().min(1, { message: 'Estado é obrigatório' })
});

type FormData = z.infer<typeof formSchema>;

export const PatientForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get patient ID from URL if in edit mode
  const { selectedClinic } = useClinic();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!id;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      birthdate: new Date(),
      gender: '',
      cpf: '',
      rg: '',
      phone: '',
      email: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  });

  // Carregar dados do paciente para edição
  useEffect(() => {
    if (id) {
      const loadPatientData = async () => {
        setIsLoading(true);
        try {
          const { patient, address } = await patientService.getPatientById(id);
          
          if (patient) {
            form.setValue('name', patient.name);
            form.setValue('gender', patient.gender);
            form.setValue('cpf', patient.cpf);
            
            if (patient.rg) form.setValue('rg', patient.rg);
            if (patient.phone) form.setValue('phone', patient.phone);
            if (patient.email) form.setValue('email', patient.email);
            
            // Converter a string de data para objeto Date
            if (patient.birthdate) {
              form.setValue('birthdate', new Date(patient.birthdate));
            }
          }

          if (address) {
            form.setValue('cep', address.cep);
            form.setValue('street', address.street);
            form.setValue('number', address.number);
            if (address.complement) form.setValue('complement', address.complement);
            form.setValue('neighborhood', address.neighborhood);
            form.setValue('city', address.city);
            form.setValue('state', address.state);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do paciente:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do paciente",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadPatientData();
    }
  }, [id, form, toast]);

  const handleSubmit = async (data: FormData) => {
    if (!selectedClinic || !user) {
      toast({
        title: "Erro",
        description: "Selecione uma clínica antes de salvar o paciente",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        // Modo de edição: atualizar paciente existente
        const { success, error } = await patientService.updatePatient(
          id,
          {
            name: data.name,
            birthdate: data.birthdate,
            gender: data.gender,
            cpf: data.cpf,
            rg: data.rg,
            phone: data.phone,
            email: data.email
          },
          {
            cep: data.cep,
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state
          }
        );

        if (!success) throw error;

        toast({
          title: "Sucesso",
          description: "Paciente atualizado com sucesso!"
        });
      } else {
        // Modo de criação: inserir novo paciente
        // Inserir o paciente
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .insert({
            name: data.name,
            birthdate: new Date(data.birthdate).toISOString().split('T')[0],
            gender: data.gender,
            cpf: data.cpf,
            rg: data.rg || null,
            phone: data.phone || null,
            email: data.email || null,
            clinic_id: selectedClinic.id,
            created_by: user.id
          })
          .select()
          .single();

        if (patientError) throw patientError;

        // Inserir o endereço do paciente
        const { error: addressError } = await supabase
          .from('patient_addresses')
          .insert({
            patient_id: patientData.id,
            cep: data.cep,
            street: data.street,
            number: data.number,
            complement: data.complement || null,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state
          });

        if (addressError) throw addressError;

        toast({
          title: "Sucesso",
          description: "Paciente cadastrado com sucesso!"
        });
      }

      navigate('/patients');
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o paciente",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold mb-1">{isEditMode ? 'Editar Paciente' : 'Novo Paciente'}</h2>
            <p className="text-gray-500">{isEditMode ? 'Atualize os dados do paciente' : 'Preencha os dados do paciente'}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p className="text-lg">Carregando dados do paciente...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <Tabs defaultValue="personal">
                <TabsList className="mb-4">
                  <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="insurance" disabled>Convênios</TabsTrigger>
                  <TabsTrigger value="documents" disabled>Documentos</TabsTrigger>
                  <TabsTrigger value="history" disabled>Histórico</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="birthdate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Nascimento</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  value={field.value instanceof Date 
                                    ? field.value.toISOString().split('T')[0]
                                    : field.value
                                  }
                                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gênero</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Masculino</SelectItem>
                                  <SelectItem value="female">Feminino</SelectItem>
                                  <SelectItem value="other">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="000.000.000-00" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="rg"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>RG</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
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
                                <Input {...field} value={field.value || ''} placeholder="(00) 00000-0000" />
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
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <h3 className="text-lg font-medium">Endereço</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="cep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="00000-000" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name="street"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Endereço</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="complement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="neighborhood"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AC">Acre</SelectItem>
                                  <SelectItem value="AL">Alagoas</SelectItem>
                                  <SelectItem value="AP">Amapá</SelectItem>
                                  <SelectItem value="AM">Amazonas</SelectItem>
                                  <SelectItem value="BA">Bahia</SelectItem>
                                  <SelectItem value="CE">Ceará</SelectItem>
                                  <SelectItem value="DF">Distrito Federal</SelectItem>
                                  <SelectItem value="ES">Espírito Santo</SelectItem>
                                  <SelectItem value="GO">Goiás</SelectItem>
                                  <SelectItem value="MA">Maranhão</SelectItem>
                                  <SelectItem value="MT">Mato Grosso</SelectItem>
                                  <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                  <SelectItem value="MG">Minas Gerais</SelectItem>
                                  <SelectItem value="PA">Pará</SelectItem>
                                  <SelectItem value="PB">Paraíba</SelectItem>
                                  <SelectItem value="PR">Paraná</SelectItem>
                                  <SelectItem value="PE">Pernambuco</SelectItem>
                                  <SelectItem value="PI">Piauí</SelectItem>
                                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                  <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                  <SelectItem value="RO">Rondônia</SelectItem>
                                  <SelectItem value="RR">Roraima</SelectItem>
                                  <SelectItem value="SC">Santa Catarina</SelectItem>
                                  <SelectItem value="SP">São Paulo</SelectItem>
                                  <SelectItem value="SE">Sergipe</SelectItem>
                                  <SelectItem value="TO">Tocantins</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={handleCancel}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button className="bg-cardio-500 hover:bg-cardio-600" type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Salvando..." : isEditMode ? "Atualizar Paciente" : "Salvar Paciente"}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="insurance">
                  <Card className="mt-4">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">Convênios do Paciente</h3>
                      <p className="text-gray-500">Selecione a aba "Dados Pessoais" e salve o paciente antes de adicionar convênios.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="documents">
                  <Card className="mt-4">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">Documentos do Paciente</h3>
                      <p className="text-gray-500">Selecione a aba "Dados Pessoais" e salve o paciente antes de adicionar documentos.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card className="mt-4">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">Histórico do Paciente</h3>
                      <p className="text-gray-500">Selecione a aba "Dados Pessoais" e salve o paciente para visualizar o histórico.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        )}
      </div>
    </Layout>
  );
};
