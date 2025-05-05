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
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Save, 
  FileUp, 
  Calendar, 
  Trash2, 
  Upload, 
  File 
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  getInsuranceCompanyById, 
  getInsuranceContractById,
  createInsuranceContract,
  updateInsuranceContract
} from '@/services/mockInsuranceService';
import { InsuranceCompany, InsuranceContract, FeeTableType } from '@/types/insurance';
import { format, parse, isValid } from 'date-fns';

const contractFormSchema = z.object({
  contractNumber: z.string().min(3, { message: "Número do contrato deve ter pelo menos 3 caracteres" }),
  startDate: z.string().refine(date => {
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    return isValid(parsedDate);
  }, { message: "Data de início inválida" }),
  endDate: z.string().refine(date => {
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    return isValid(parsedDate);
  }, { message: "Data de término inválida" }),
  feeTable: z.enum(['CBHPM', 'AMB', 'CUSTOM'] as const),
  multiplicationFactor: z.coerce.number().min(0.1, { message: "Fator de multiplicação deve ser no mínimo 0.1" }),
  paymentDeadlineDays: z.coerce.number().min(1, { message: "Prazo de pagamento deve ser no mínimo 1 dia" }),
  active: z.boolean().default(true),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

export const InsuranceContractForm: React.FC = () => {
  const { id, contractId } = useParams<{ id: string; contractId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<InsuranceCompany | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      contractNumber: "",
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
      feeTable: 'CBHPM',
      multiplicationFactor: 1,
      paymentDeadlineDays: 30,
      active: true,
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
        const companyData = await getInsuranceCompanyById(id);

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

        if (contractId && contractId !== 'new') {
          const contractData = await getInsuranceContractById(contractId);
          
          if (contractData) {
            form.reset({
              contractNumber: contractData.contractNumber,
              startDate: contractData.startDate,
              endDate: contractData.endDate,
              feeTable: contractData.feeTable as FeeTableType,
              multiplicationFactor: contractData.multiplicationFactor,
              paymentDeadlineDays: contractData.paymentDeadlineDays,
              active: contractData.active,
            });
            
            setDocumentUrls(contractData.documentUrls);
          } else {
            toast({
              title: "Erro",
              description: "Contrato não encontrado",
              variant: "destructive",
            });
            navigate(`/insurance/${id}/contracts`);
          }
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
  }, [id, contractId, form, navigate]);

  const onSubmit = async (values: ContractFormValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      
      const contractData: Partial<InsuranceContract> = {
        insuranceCompanyId: id,
        contractNumber: values.contractNumber,
        startDate: values.startDate,
        endDate: values.endDate,
        feeTable: values.feeTable,
        multiplicationFactor: values.multiplicationFactor,
        paymentDeadlineDays: values.paymentDeadlineDays,
        active: values.active,
        documentUrls: documentUrls,
      };
      
      // In a real implementation, you would upload the documents
      // and update documentUrls with the returned URLs
      if (documents.length > 0) {
        // Mock document URLs for demonstration
        const newDocUrls = documents.map(file => URL.createObjectURL(file));
        contractData.documentUrls = [...documentUrls, ...newDocUrls];
      }
      
      if (contractId && contractId !== 'new') {
        await updateInsuranceContract(contractId, contractData);
        toast({
          title: "Sucesso",
          description: "Contrato atualizado com sucesso",
        });
      } else {
        await createInsuranceContract(contractData as Omit<InsuranceContract, 'id' | 'createdAt' | 'updatedAt'>);
        toast({
          title: "Sucesso",
          description: "Contrato criado com sucesso",
        });
      }
      
      navigate(`/insurance/${id}/contracts`);
    } catch (error) {
      console.error("Error saving contract:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o contrato",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = (index: number) => {
    setDocumentUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    navigate(`/insurance/${id}/contracts`);
  };

  const getDocumentName = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(`/insurance/${id}/contracts`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {contractId && contractId !== 'new' ? 'Editar' : 'Novo'} Contrato
            </h2>
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
                <CardHeader className="pb-4">
                  <CardTitle>Dados do Contrato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="contractNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Contrato</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input type="date" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Término</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input type="date" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="feeTable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tabela de Valores</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma tabela" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CBHPM">CBHPM</SelectItem>
                              <SelectItem value="AMB">AMB</SelectItem>
                              <SelectItem value="CUSTOM">Tabela Própria</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="multiplicationFactor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fator de Multiplicação</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormDescription>
                            Ex: 1.2x sobre os valores da tabela
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentDeadlineDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo para Pagamento (dias)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Status do Contrato</FormLabel>
                          <FormDescription>
                            {field.value ? 'Ativo' : 'Inativo'}
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
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Documentos do Contrato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Button type="button" variant="outline" className="relative">
                      <input
                        type="file"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleDocumentUpload}
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Documentos
                    </Button>
                  </div>
                  
                  {/* New documents to upload */}
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Novos Documentos</h4>
                      <div className="border rounded-md divide-y">
                        {documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{doc.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({Math.round(doc.size / 1024)} KB)
                              </span>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeDocument(index)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Existing documents */}
                  {documentUrls.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Documentos Salvos</h4>
                      <div className="border rounded-md divide-y">
                        {documentUrls.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{getDocumentName(url)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                              >
                                <FileUp className="h-4 w-4" />
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeExistingDocument(index)}
                                className="h-8 w-8 p-0 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {documents.length === 0 && documentUrls.length === 0 && (
                    <div className="text-center py-6 border border-dashed rounded-md">
                      <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Nenhum documento adicionado
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Adicione documentos do contrato como PDF, DOCX ou imagens
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-cardio-500 hover:bg-cardio-600"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Salvando...' : 'Salvar Contrato'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </Layout>
  );
};
