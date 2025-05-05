
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PlusCircle, 
  Search, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Download 
} from 'lucide-react';
import { 
  getInsuranceCompanyById, 
  getInsuranceContracts 
} from '@/services/mockInsuranceService';
import { InsuranceCompany, InsuranceContract } from '@/types/insurance';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const InsuranceContractList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<InsuranceCompany | null>(null);
  const [contracts, setContracts] = useState<InsuranceContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/insurance');
        return;
      }

      try {
        setIsLoading(true);
        const [companyData, contractsData] = await Promise.all([
          getInsuranceCompanyById(id),
          getInsuranceContracts(id)
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
        setContracts(contractsData);
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

  const filteredContracts = contracts.filter(contract => 
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getContractStatus = (contract: InsuranceContract) => {
    const today = new Date();
    const endDate = parseISO(contract.endDate);
    
    if (!contract.active) {
      return { label: "Inativo", variant: "outline" as const };
    }
    
    if (isAfter(today, endDate)) {
      return { label: "Vencido", variant: "destructive" as const };
    }
    
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    if (isBefore(endDate, threeMonthsFromNow)) {
      return { label: "Vencendo em breve", variant: "warning" as const };
    }
    
    return { label: "Vigente", variant: "success" as const };
  };

  const getFeeTableLabel = (type: string) => {
    switch (type) {
      case 'CBHPM':
        return 'CBHPM';
      case 'AMB':
        return 'AMB';
      case 'CUSTOM':
        return 'Tabela Própria';
      default:
        return type;
    }
  };

  const handleNewContract = () => {
    navigate(`/insurance/${id}/contracts/new`);
  };

  const handleEditContract = (contractId: string) => {
    navigate(`/insurance/${id}/contracts/${contractId}`);
  };

  const handleBackToList = () => {
    navigate('/insurance');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">Contratos</h2>
            <p className="text-muted-foreground">
              {company ? `Gerenciar contratos de ${company.tradingName}` : 'Carregando...'}
            </p>
          </div>
          <Button onClick={handleNewContract} className="bg-cardio-500 hover:bg-cardio-600">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        {company && (
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Dados do Convênio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
                  <p className="text-base">{company.tradingName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                  <p className="text-base">{company.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registro ANS</p>
                  <p className="text-base">{company.ansRegistry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-base">
                    {company.active ? (
                      <Badge className="bg-green-500">Ativo</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">Inativo</Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número do contrato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cardio-500"></div>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-2" />
                <h3 className="text-lg font-medium">Nenhum contrato encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Tente buscar com outros termos" : "Clique em 'Novo Contrato' para adicionar"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número do Contrato</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Fator</TableHead>
                    <TableHead>Prazo Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => {
                    const status = getContractStatus(contract);
                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {format(parseISO(contract.startDate), "dd/MM/yyyy", { locale: ptBR })} a{' '}
                              {format(parseISO(contract.endDate), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getFeeTableLabel(contract.feeTable)}</TableCell>
                        <TableCell>{contract.multiplicationFactor}x</TableCell>
                        <TableCell>{contract.paymentDeadlineDays} dias</TableCell>
                        <TableCell>
                          <Badge 
                            variant={status.variant === 'warning' ? 'outline' : status.variant}
                            className={status.variant === 'warning' ? 'text-orange-500 border-orange-200 bg-orange-50' : ''}
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {contract.documentUrls.length > 0 && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                title="Baixar documentos"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleEditContract(contract.id)}
                            >
                              Editar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
