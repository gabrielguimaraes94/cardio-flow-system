import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Upload, Building2, Trash2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
{/* Schema for form validation */}
const insuranceFormSchema = z.object({
  companyName: z.string().min(5, "Razão social deve ter pelo menos 5 caracteres"),
  tradingName: z.string().min(2, "Nome fantasia deve ter pelo menos 2 caracteres"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ deve estar no formato 00.000.000/0000-00"),
  ansRegistry: z.string().min(5, "Registro ANS deve ter pelo menos 5 caracteres"),
  street: z.string().min(3, "Rua deve ter pelo menos 3 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "Estado deve ter pelo menos 2 caracteres"),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),
  contactPerson: z.string().optional(),
  active: z.boolean().default(true)
});
type InsuranceFormValues = z.infer<typeof insuranceFormSchema>;
export const InsuranceForm: React.FC = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const {
    user
  } = useAuth();
  const {
    selectedClinic
  } = useClinic();
  const {
    toast
  } = useToast();
  const form = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceFormSchema),
    defaultValues: {
      companyName: "",
      tradingName: "",
      cnpj: "",
      ansRegistry: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      email: "",
      phone: "",
      contactPerson: "",
      active: true
    }
  });
  {/* Load insurance company data */}
  useEffect(() => {
    if (id && id !== 'new' && user) {
      setIsLoading(true);
      supabase.from('insurance_companies').select('*').eq('id', id).eq('created_by', user.id).single().then(({
        data,
        error
      }) => {
        if (error || !data) {
          toast({
            title: "Erro",
            description: "Convênio não encontrado",
            variant: "destructive"
          });
          navigate('/insurance');
          return;
        }
        form.reset({
          companyName: data.company_name,
          tradingName: data.trading_name,
          cnpj: data.cnpj,
          ansRegistry: data.ans_registry,
          street: data.street,
          number: data.number,
          complement: data.complement || "",
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zip_code,
          email: data.email,
          phone: data.phone,
          contactPerson: data.contact_person || "",
          active: data.active
        });
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }).then(() => {
        setIsLoading(false);
      }, error => {
        console.error("Error loading insurance company:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do convênio",
          variant: "destructive"
        });
        setIsLoading(false);
      });
    }
  }, [id, user]);
  {/* Submit form handler */}
  const onSubmit = async (values: InsuranceFormValues) => {
    if (!user || !selectedClinic) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado e ter uma clínica selecionada",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const insuranceData = {
        company_name: values.companyName,
        trading_name: values.tradingName,
        cnpj: values.cnpj,
        ans_registry: values.ansRegistry,
        street: values.street,
        number: values.number,
        complement: values.complement,
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state,
        zip_code: values.zipCode,
        email: values.email,
        phone: values.phone,
        contact_person: values.contactPerson,
        active: values.active,
        created_by: user.id,
        clinic_id: selectedClinic.id,
        logo_url: await uploadLogo()
      };
      let result;
      if (id && id !== 'new') {
        result = await supabase.from('insurance_companies').update(insuranceData).eq('id', id);
        if (!result.error) {
          toast({
            title: "Sucesso",
            description: "Convênio atualizado com sucesso"
          });
        }
      } else {
        result = await supabase.from('insurance_companies').insert(insuranceData).select('id').single();
        if (!result.error) {
          toast({
            title: "Sucesso",
            description: "Convênio criado com sucesso"
          });
          if (result.data?.id) {
            navigate(`/insurance/${result.data.id}`);
          }
        }
      }
      if (result.error) throw result.error;
    } catch (error: any) {
      console.error("Error saving insurance company:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o convênio",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  {/* Upload logo helper function */}
  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return null;
    try {
      const fileExt = logoFile.name.split('.').pop();
      const filePath = `insurance_logos/${user.id}/${Date.now()}.${fileExt}`;
      const {
        error: uploadError
      } = await supabase.storage.from('insurance_logos').upload(filePath, logoFile, {
        upsert: true,
        cacheControl: '3600'
      });
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('insurance_logos').getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      return null;
    }
  };
  {/* Logo change handler */}
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  const canSubmit = user && selectedClinic;
  if (isLoading) {
    return <Layout>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cardio-500"></div>
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/insurance')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {id && id !== 'new' ? 'Editar' : 'Novo'} Convênio
            </h2>
            <p className="text-muted-foreground">
              {id && id !== 'new' ? 'Atualize os dados do convênio' : 'Preencha os dados para cadastrar um novo convênio'}
            </p>
          </div>
        </div>

        {/* Permission alert */}
        {!canSubmit && <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              {!user ? 'Você precisa estar logado para gerenciar convênios.' : 'Selecione uma clínica para gerenciar convênios. Use o seletor de clínicas no cabeçalho.'}
            </AlertDescription>
          </Alert>}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general">Dados Gerais</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="contact">Contato</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                        <FormField control={form.control} name="companyName" render={({
                        field
                      }) => <FormItem>
                            <FormLabel>Razão Social</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>} />
                        
                        <FormField control={form.control} name="tradingName" render={({
                        field
                      }) => <FormItem>
                            <FormLabel>Nome Fantasia</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="cnpj" render={({
                          field
                        }) => <FormItem>
                              <FormLabel>CNPJ</FormLabel>
                              <FormControl><Input {...field} placeholder="00.000.000/0000-00" /></FormControl>
                              <FormMessage />
                            </FormItem>} />
                          
                          <FormField control={form.control} name="ansRegistry" render={({
                          field
                        }) => <FormItem>
                              <FormLabel>Registro ANS</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>} />
                        </div>
                        
                        <FormField control={form.control} name="active" render={({
                        field
                      }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Status do Convênio</FormLabel>
                              <FormDescription>{field.value ? 'Ativo' : 'Inativo'}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>} />
                      </div>
                      
                      {/* Logo section */}
                      <div className="md:w-1/3 flex flex-col items-center space-y-4">
                        <div className="text-center flex flex-col items-center ">
                          <FormLabel className="block mb-2">Logo da Operadora</FormLabel>
                          <div className="w-40 h-40 mb-4 border rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                            {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" /> : <Building2 className="h-16 w-16 text-gray-300" />}
                          </div>
                          <Button type="button" variant="outline" className="relative">
                            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleLogoChange} />
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Logo
                          </Button>
                          <FormDescription className="mt-2 text-xs text-center">
                            Recomendado: 200x200px, PNG ou JPG
                          </FormDescription>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="address" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <FormField control={form.control} name="zipCode" render={({
                    field
                  }) => <FormItem className="max-w-xs">
                        <FormLabel>CEP</FormLabel>
                        <FormControl><Input {...field} placeholder="00000-000" /></FormControl>
                        <FormMessage />
                      </FormItem>} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-3">
                        <FormField control={form.control} name="street" render={({
                        field
                      }) => <FormItem>
                            <FormLabel>Logradouro</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>} />
                      </div>
                      
                      <FormField control={form.control} name="number" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="complement" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>} />
                      
                      <FormField control={form.control} name="neighborhood" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-3">
                        <FormField control={form.control} name="city" render={({
                        field
                      }) => <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>} />
                      </div>
                      
                      <FormField control={form.control} name="state" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <FormField control={form.control} name="email" render={({
                    field
                  }) => <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input {...field} type="email" /></FormControl>
                        <FormMessage />
                      </FormItem>} />
                    
                    <FormField control={form.control} name="phone" render={({
                    field
                  }) => <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl><Input {...field} placeholder="(00) 0000-0000" /></FormControl>
                        <FormMessage />
                      </FormItem>} />
                    
                    <FormField control={form.control} name="contactPerson" render={({
                    field
                  }) => <FormItem>
                        <FormLabel>Pessoa de Contato</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormDescription>
                          Nome da pessoa responsável pelo contato com a operadora
                        </FormDescription>
                        <FormMessage />
                      </FormItem>} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form actions */}
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/insurance')} disabled={isSubmitting || !canSubmit}>
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" className="bg-cardio-500 hover:bg-cardio-600" disabled={isSubmitting || !canSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Salvando...' : 'Salvar Convênio'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>;
};