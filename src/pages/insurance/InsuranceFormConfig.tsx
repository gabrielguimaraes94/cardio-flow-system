
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  AlertCircle,
  FileType
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  getInsuranceCompanyById, 
  getFormConfigs,
  createFormConfig,
  updateFormConfig
} from '@/services/mockInsuranceService';
import { InsuranceCompany, InsuranceFormConfig } from '@/types/insurance';

const formConfigSchema = z.object({
  formTitle: z.string().min(5, { message: "Título do formulário deve ter pelo menos 5 caracteres" }),
  requiredFields: z.array(z.string()).min(1, { message: "Selecione pelo menos um campo obrigatório" }),
  validationRules: z.array(z.object({
    fieldName: z.string().min(1, { message: "Nome do campo é obrigatório" }),
    rule: z.string().min(1, { message: "Regra de validação é obrigatória" }),
    errorMessage: z.string().min(1, { message: "Mensagem de erro é obrigatória" }),
  })),
  allowedFileTypes: z.array(z.string()).min(1, { message: "Selecione pelo menos um tipo de arquivo" }),
  maxFileSize: z.coerce.number().min(1, { message: "Tamanho máximo deve ser pelo menos 1MB" }),
});

type FormConfigValues = z.infer<typeof formConfigSchema>;

export const InsuranceFormConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<InsuranceCompany | null>(null);
  const [formConfig, setFormConfig] = useState<InsuranceFormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newField, setNewField] = useState("");
  const [newRule, setNewRule] = useState({ fieldName: "", rule: "", errorMessage: "" });

  const availableFields = [
    { id: "patientName", label: "Nome do Paciente" },
    { id: "patientCPF", label: "CPF do Paciente" },
    { id: "patientBirthDate", label: "Data de Nascimento" },
    { id: "patientCardNumber", label: "Número do Cartão" },
    { id: "patientPlan", label: "Plano" },
    { id: "procedureCode", label: "Código do Procedimento" },
    { id: "procedureName", label: "Nome do Procedimento" },
    { id: "justification", label: "Justificativa" },
    { id: "physicianCRM", label: "CRM do Médico" },
    { id: "physicianSpecialty", label: "Especialidade do Médico" },
    { id: "attachments", label: "Anexos" },
  ];

  const fileTypes = [
    { id: "pdf", label: "PDF" },
    { id: "jpg", label: "JPG" },
    { id: "png", label: "PNG" },
    { id: "doc", label: "DOC" },
    { id: "docx", label: "DOCX" },
  ];

  const form = useForm<FormConfigValues>({
    resolver: zodResolver(formConfigSchema),
    defaultValues: {
      formTitle: "",
      requiredFields: [],
      validationRules: [],
      allowedFileTypes: ["pdf"],
      maxFileSize: 5,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/insurance');
        return;
      }

      try {
        setIsLoading(true);
        const [companyData, formConfigsData] = await Promise.all([
          getInsuranceCompanyById(id),
          getFormConfigs(id)
        ]);

        if (!companyData) {
          toast({
            title: "Erro",
            description: "Convênio não encontrado",
            variant: "destructive",
          });
          navigate('/insurance');
          return;
        }

        setCompany(companyData);

        // Get the first form config or null
        const config = formConfigsData.length > 0 ? formConfigsData[0] : null;
        setFormConfig(config);

        if (config) {
          form.reset({
            formTitle: config.formTitle,
            requiredFields: config.requiredFields,
            validationRules: config.validationRules,
            allowedFileTypes: config.allowedFileTypes,
            maxFileSize: config.maxFileSize / 1048576, // Convert bytes to MB
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, form, navigate]);

  const onSubmit = async (values: FormConfigValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      
      const formConfigData: Partial<InsuranceFormConfig> = {
        insuranceCompanyId: id,
        formTitle: values.formTitle,
        requiredFields: values.requiredFields,
        validationRules: values.validationRules,
        allowedFileTypes: values.allowedFileTypes,
        maxFileSize: values.maxFileSize * 1048576, // Convert MB to bytes
      };
      
      if (formConfig) {
        await updateFormConfig(formConfig.id, formConfigData);
        toast({
          title: "Sucesso",
          description: "Configurações do formulário atualizadas com sucesso",
        });
      } else {
        await createFormConfig(formConfigData as Omit<InsuranceFormConfig, 'id' | 'createdAt' | 'updatedAt'>);
        toast({
          title: "Sucesso",
          description: "Configurações do formulário criadas com sucesso",
        });
      }
      
      navigate(`/insurance/${id}`);
    } catch (error) {
      console.error("Error saving form config:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações do formulário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addValidationRule = () => {
    if (!newRule.fieldName || !newRule.rule || !newRule.errorMessage) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos da regra de validação",
        variant: "destructive",
      });
      return;
    }

    const currentRules = form.getValues('validationRules') || [];
    form.setValue('validationRules', [...currentRules, newRule]);
    setNewRule({ fieldName: "", rule: "", errorMessage: "" });
  };

  const removeValidationRule = (index: number) => {
    const currentRules = form.getValues('validationRules') || [];
    form.setValue('validationRules', currentRules.filter((_, i) => i !== index));
  };

  const addCustomField = () => {
    if (!newField.trim()) {
      toast({
        title: "Erro",
        description: "O nome do campo personalizado não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    const currentFields = form.getValues('requiredFields') || [];
    form.setValue('requiredFields', [...currentFields, newField]);
    setNewField("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(`/insurance/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Configuração de Formulários</h2>
            <p className="text-muted-foreground">
              {company ? `${company.tradingName}` : 'Carregando...'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cardio-500"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais do Formulário</CardTitle>
                  <CardDescription>
                    Configure como os formulários de solicitação para este convênio devem ser preenchidos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="formTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Formulário</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Ex: "Solicitação de Procedimentos Cardiológicos - {company?.tradingName}"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campos Obrigatórios</CardTitle>
                  <CardDescription>
                    Selecione quais campos são obrigatórios para este convênio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="requiredFields"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Campos disponíveis</FormLabel>
                          <FormDescription>
                            Selecione os campos que devem ser obrigatórios no formulário
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableFields.map((field) => (
                            <FormField
                              key={field.id}
                              control={form.control}
                              name="requiredFields"
                              render={({ field: formField }) => {
                                return (
                                  <FormItem
                                    key={field.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={formField.value?.includes(field.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? formField.onChange([...formField.value, field.id])
                                            : formField.onChange(
                                                formField.value?.filter(
                                                  (value) => value !== field.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {field.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        
                        <div className="mt-6">
                          <FormLabel>Campo Personalizado</FormLabel>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              value={newField}
                              onChange={(e) => setNewField(e.target.value)}
                              placeholder="Nome do campo personalizado"
                            />
                            <Button type="button" onClick={addCustomField} className="whitespace-nowrap">
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar
                            </Button>
                          </div>
                        </div>
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regras de Validação</CardTitle>
                  <CardDescription>
                    Defina regras de validação específicas para campos do formulário
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <FormLabel>Campo</FormLabel>
                      <Input
                        value={newRule.fieldName}
                        onChange={(e) => setNewRule({ ...newRule, fieldName: e.target.value })}
                        placeholder="Ex: patientCardNumber"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <FormLabel>Regra (Expressão Regular)</FormLabel>
                      <Input
                        value={newRule.rule}
                        onChange={(e) => setNewRule({ ...newRule, rule: e.target.value })}
                        placeholder="Ex: ^[0-9]{16}$"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <FormLabel>Mensagem de Erro</FormLabel>
                      <Input
                        value={newRule.errorMessage}
                        onChange={(e) => setNewRule({ ...newRule, errorMessage: e.target.value })}
                        placeholder="Ex: Deve conter 16 dígitos"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Button 
                      type="button" 
                      onClick={addValidationRule}
                      className="bg-cardio-500 hover:bg-cardio-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Regra
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Regras Configuradas</FormLabel>
                    <div className="border rounded-md divide-y">
                      {form.watch('validationRules')?.length > 0 ? (
                        form.watch('validationRules').map((rule, index) => (
                          <div key={index} className="flex items-center justify-between p-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              <div className="text-sm">
                                <span className="font-medium">Campo:</span> {rule.fieldName}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Regra:</span> {rule.rule}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Mensagem:</span> {rule.errorMessage}
                              </div>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeValidationRule(index)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted-foreground">
                          <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                          Nenhuma regra de validação configurada
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Arquivos</CardTitle>
                  <CardDescription>
                    Defina quais tipos de arquivos podem ser anexados e limites de tamanho
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="allowedFileTypes"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Tipos de arquivos permitidos</FormLabel>
                          <FormDescription>
                            Selecione quais formatos podem ser enviados
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {fileTypes.map((type) => (
                            <FormField
                              key={type.id}
                              control={form.control}
                              name="allowedFileTypes"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={type.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(type.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, type.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== type.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <div className="flex items-center space-x-1">
                                      <FileType className="h-4 w-4 text-muted-foreground" />
                                      <FormLabel className="font-normal">
                                        {type.label}
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxFileSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamanho máximo por arquivo (MB)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" step="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Limite máximo de tamanho para cada arquivo anexado
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/insurance/${id}`)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-cardio-500 hover:bg-cardio-600"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </Layout>
  );
};
