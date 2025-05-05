
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Search,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  getInsuranceCompanyById, 
  getAuditRules,
  createAuditRule,
  updateAuditRule,
  deleteAuditRule
} from '@/services/mockInsuranceService';
import { InsuranceCompany, InsuranceAuditRule } from '@/types/insurance';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const materialSchema = z.object({
  materialCode: z.string().min(1, { message: "Código é obrigatório" }),
  materialName: z.string().min(1, { message: "Nome é obrigatório" }),
  maxQuantity: z.coerce.number().min(1, { message: "Quantidade máxima deve ser pelo menos 1" }),
});

const auditRuleSchema = z.object({
  procedureCode: z.string().min(1, { message: "Código do procedimento é obrigatório" }),
  procedureName: z.string().min(1, { message: "Nome do procedimento é obrigatório" }),
  materialLimits: z.array(materialSchema).min(0),
  preApprovedJustifications: z.array(z.string()).min(0),
  requiresSecondOpinion: z.boolean(),
  requiresPriorAuthorization: z.boolean(),
  authorizationDocuments: z.array(z.string()).min(0),
});

type AuditRuleFormValues = z.infer<typeof auditRuleSchema>;

export const InsuranceAuditRules: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<InsuranceCompany | null>(null);
  const [auditRules, setAuditRules] = useState<InsuranceAuditRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<InsuranceAuditRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMaterial, setNewMaterial] = useState({ materialCode: "", materialName: "", maxQuantity: 1 });
  const [newJustification, setNewJustification] = useState("");
  const [newDocument, setNewDocument] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm<AuditRuleFormValues>({
    resolver: zodResolver(auditRuleSchema),
    defaultValues: {
      procedureCode: "",
      procedureName: "",
      materialLimits: [],
      preApprovedJustifications: [],
      requiresSecondOpinion: false,
      requiresPriorAuthorization: false,
      authorizationDocuments: [],
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
        const [companyData, auditRulesData] = await Promise.all([
          getInsuranceCompanyById(id),
          getAuditRules(id)
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
        setAuditRules(auditRulesData);
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
  }, [id, navigate]);

  const filteredRules = auditRules.filter(rule => 
    rule.procedureName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rule.procedureCode.includes(searchTerm)
  );

  const selectRule = (rule: InsuranceAuditRule) => {
    setSelectedRule(rule);
    form.reset({
      procedureCode: rule.procedureCode,
      procedureName: rule.procedureName,
      materialLimits: rule.materialLimits,
      preApprovedJustifications: rule.preApprovedJustifications,
      requiresSecondOpinion: rule.requiresSecondOpinion,
      requiresPriorAuthorization: rule.requiresPriorAuthorization,
      authorizationDocuments: rule.authorizationDocuments,
    });
    setShowAddForm(true);
  };

  const addNewRule = () => {
    setSelectedRule(null);
    form.reset({
      procedureCode: "",
      procedureName: "",
      materialLimits: [],
      preApprovedJustifications: [],
      requiresSecondOpinion: false,
      requiresPriorAuthorization: false,
      authorizationDocuments: [],
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setShowAddForm(false);
    setSelectedRule(null);
  };

  const onSubmit = async (values: AuditRuleFormValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      
      const auditRuleData: Partial<InsuranceAuditRule> = {
        insuranceCompanyId: id,
        ...values
      };
      
      if (selectedRule) {
        await updateAuditRule(selectedRule.id, auditRuleData);
        toast({
          title: "Sucesso",
          description: "Regra de auditoria atualizada com sucesso",
        });
      } else {
        await createAuditRule(auditRuleData as Omit<InsuranceAuditRule, 'id' | 'createdAt' | 'updatedAt'>);
        toast({
          title: "Sucesso",
          description: "Regra de auditoria criada com sucesso",
        });
      }
      
      // Refresh the list
      const updatedRules = await getAuditRules(id);
      setAuditRules(updatedRules);
      setShowAddForm(false);
      setSelectedRule(null);
    } catch (error) {
      console.error("Error saving audit rule:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a regra de auditoria",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta regra de auditoria?")) {
      return;
    }

    try {
      await deleteAuditRule(ruleId);
      toast({
        title: "Sucesso",
        description: "Regra de auditoria excluída com sucesso",
      });
      
      // Refresh the list
      const updatedRules = await getAuditRules(id!);
      setAuditRules(updatedRules);
    } catch (error) {
      console.error("Error deleting audit rule:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a regra de auditoria",
        variant: "destructive",
      });
    }
  };

  const addMaterial = () => {
    if (!newMaterial.materialCode || !newMaterial.materialName || newMaterial.maxQuantity < 1) {
      toast({
        title: "Erro",
        description: "Preencha corretamente todos os campos do material",
        variant: "destructive",
      });
      return;
    }

    const currentMaterials = form.getValues('materialLimits') || [];
    form.setValue('materialLimits', [...currentMaterials, newMaterial]);
    setNewMaterial({ materialCode: "", materialName: "", maxQuantity: 1 });
  };

  const removeMaterial = (index: number) => {
    const currentMaterials = form.getValues('materialLimits') || [];
    form.setValue('materialLimits', currentMaterials.filter((_, i) => i !== index));
  };

  const addJustification = () => {
    if (!newJustification.trim()) {
      toast({
        title: "Erro",
        description: "A justificativa não pode estar vazia",
        variant: "destructive",
      });
      return;
    }

    const currentJustifications = form.getValues('preApprovedJustifications') || [];
    form.setValue('preApprovedJustifications', [...currentJustifications, newJustification]);
    setNewJustification("");
  };

  const removeJustification = (index: number) => {
    const currentJustifications = form.getValues('preApprovedJustifications') || [];
    form.setValue('preApprovedJustifications', currentJustifications.filter((_, i) => i !== index));
  };

  const addDocument = () => {
    if (!newDocument.trim()) {
      toast({
        title: "Erro",
        description: "O documento não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    const currentDocuments = form.getValues('authorizationDocuments') || [];
    form.setValue('authorizationDocuments', [...currentDocuments, newDocument]);
    setNewDocument("");
  };

  const removeDocument = (index: number) => {
    const currentDocuments = form.getValues('authorizationDocuments') || [];
    form.setValue('authorizationDocuments', currentDocuments.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(`/insurance/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">Regras de Auditoria</h2>
            <p className="text-muted-foreground">
              {company ? `${company.tradingName}` : 'Carregando...'}
            </p>
          </div>
          {!showAddForm && (
            <Button onClick={addNewRule} className="bg-cardio-500 hover:bg-cardio-600">
              <Plus className="mr-2 h-4 w-4" />
              Nova Regra
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cardio-500"></div>
          </div>
        ) : (
          <>
            {showAddForm ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedRule ? 'Editar' : 'Nova'} Regra de Auditoria</CardTitle>
                      <CardDescription>
                        Defina limites e regras para procedimentos específicos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="procedureCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código do Procedimento</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="procedureName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Procedimento</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Limites de Materiais</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div className="md:col-span-2">
                            <FormLabel>Código do Material</FormLabel>
                            <Input 
                              value={newMaterial.materialCode}
                              onChange={(e) => setNewMaterial({ ...newMaterial, materialCode: e.target.value })}
                              placeholder="Ex: M001"
                              className="mt-2"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <FormLabel>Nome do Material</FormLabel>
                            <Input 
                              value={newMaterial.materialName}
                              onChange={(e) => setNewMaterial({ ...newMaterial, materialName: e.target.value })}
                              placeholder="Ex: Stent Farmacológico"
                              className="mt-2"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <FormLabel>Quantidade</FormLabel>
                            <Input 
                              type="number"
                              min="1"
                              value={newMaterial.maxQuantity}
                              onChange={(e) => setNewMaterial({ 
                                ...newMaterial, 
                                maxQuantity: parseInt(e.target.value) || 1 
                              })}
                              className="mt-2"
                            />
                          </div>
                        </div>
                        
                        <Button type="button" variant="outline" onClick={addMaterial}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Material
                        </Button>
                        
                        <div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Material</TableHead>
                                <TableHead>Quantidade Máxima</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {form.watch('materialLimits')?.length > 0 ? (
                                form.watch('materialLimits').map((material, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{material.materialCode}</TableCell>
                                    <TableCell>{material.materialName}</TableCell>
                                    <TableCell>{material.maxQuantity}</TableCell>
                                    <TableCell>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeMaterial(index)}
                                        className="h-8 w-8 p-0 text-destructive"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                    Nenhum material adicionado
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Justificativas Pré-Aprovadas</h3>
                        
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <FormLabel>Adicionar Justificativa</FormLabel>
                            <Textarea 
                              value={newJustification}
                              onChange={(e) => setNewJustification(e.target.value)}
                              placeholder="Ex: Estenose coronária acima de 70%"
                              className="mt-2"
                              rows={2}
                            />
                          </div>
                          <Button type="button" variant="outline" onClick={addJustification}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                        
                        <div className="border rounded-md divide-y">
                          {form.watch('preApprovedJustifications')?.length > 0 ? (
                            form.watch('preApprovedJustifications').map((justification, index) => (
                              <div key={index} className="flex items-center justify-between p-3">
                                <div className="text-sm flex items-start gap-2">
                                  <FileCheck className="h-4 w-4 text-green-500 mt-0.5" />
                                  <span>{justification}</span>
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeJustification(index)}
                                  className="h-8 w-8 p-0 text-destructive ml-2 flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-muted-foreground">
                              <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                              Nenhuma justificativa pré-aprovada
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="requiresSecondOpinion"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Exige Segunda Opinião Médica</FormLabel>
                                <FormDescription>
                                  {field.value 
                                    ? 'Requer avaliação de outro médico' 
                                    : 'Não exige segunda opinião'}
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
                          name="requiresPriorAuthorization"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Exige Autorização Prévia</FormLabel>
                                <FormDescription>
                                  {field.value 
                                    ? 'Requer autorização prévia do convênio' 
                                    : 'Não exige autorização prévia'}
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
                      
                      <div 
                        className={`space-y-4 transition-all ${
                          form.watch('requiresPriorAuthorization') ? 'opacity-100' : 'opacity-50'
                        }`}
                      >
                        <h3 className="text-lg font-medium">Documentos Necessários para Autorização</h3>
                        <p className="text-muted-foreground text-sm">
                          {form.watch('requiresPriorAuthorization') 
                            ? 'Documentos exigidos pelo convênio para autorização prévia' 
                            : 'Ative a opção de autorização prévia para gerenciar documentos'}
                        </p>
                        
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <FormLabel>Adicionar Documento</FormLabel>
                            <Input 
                              value={newDocument}
                              onChange={(e) => setNewDocument(e.target.value)}
                              placeholder="Ex: Laudo de exames anteriores"
                              className="mt-2"
                              disabled={!form.watch('requiresPriorAuthorization')}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={addDocument}
                            disabled={!form.watch('requiresPriorAuthorization')}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                        
                        <div className="border rounded-md divide-y">
                          {form.watch('authorizationDocuments')?.length > 0 ? (
                            form.watch('authorizationDocuments').map((document, index) => (
                              <div key={index} className="flex items-center justify-between p-3">
                                <div className="text-sm flex items-start gap-2">
                                  <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                                  <span>{document}</span>
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeDocument(index)}
                                  className="h-8 w-8 p-0 text-destructive ml-2 flex-shrink-0"
                                  disabled={!form.watch('requiresPriorAuthorization')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-muted-foreground">
                              <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                              Nenhum documento necessário
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={cancelEdit}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-cardio-500 hover:bg-cardio-600"
                        disabled={isSubmitting}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Salvando...' : 'Salvar Regra'}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar procedimento por nome ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  {filteredRules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertTriangle className="h-12 w-12 text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium">Nenhuma regra de auditoria encontrada</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? "Tente buscar com outros termos" : "Clique em 'Nova Regra' para adicionar"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredRules.map((rule) => (
                        <Card key={rule.id} className="overflow-hidden">
                          <CardHeader className="pb-2 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg font-medium">
                                  {rule.procedureName}
                                </CardTitle>
                                <CardDescription>
                                  Código: {rule.procedureCode}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => selectRule(rule)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive/90"
                                  onClick={() => handleDeleteRule(rule.id)}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Limites de Materiais</h4>
                                {rule.materialLimits.length > 0 ? (
                                  <div className="space-y-2">
                                    {rule.materialLimits.map((material, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-sm border-b pb-1">
                                        <span>{material.materialName}</span>
                                        <Badge variant="outline">{material.maxQuantity} un.</Badge>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Nenhum limite configurado
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Justificativas Pré-Aprovadas</h4>
                                {rule.preApprovedJustifications.length > 0 ? (
                                  <ul className="list-disc list-inside space-y-1">
                                    {rule.preApprovedJustifications.map((justification, idx) => (
                                      <li key={idx} className="text-sm">
                                        {justification}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Nenhuma justificativa configurada
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Outras Exigências</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={rule.requiresSecondOpinion ? "default" : "outline"}>
                                      {rule.requiresSecondOpinion ? "Requer" : "Não requer"} segunda opinião
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={rule.requiresPriorAuthorization ? "default" : "outline"}>
                                      {rule.requiresPriorAuthorization ? "Requer" : "Não requer"} autorização prévia
                                    </Badge>
                                  </div>
                                  
                                  {rule.requiresPriorAuthorization && rule.authorizationDocuments.length > 0 && (
                                    <div className="mt-4">
                                      <h5 className="text-sm font-medium mb-1">Documentos Necessários:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {rule.authorizationDocuments.map((doc, idx) => (
                                          <li key={idx} className="text-sm">
                                            {doc}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
