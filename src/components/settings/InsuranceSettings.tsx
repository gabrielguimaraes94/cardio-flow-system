
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { PlusCircle, Search, Building2, FileText, Settings, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { InsuranceCompany } from '@/types/insurance';
import { useAuth } from '@/contexts/AuthContext';

export const InsuranceSettings: React.FC = () => {
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadInsuranceCompanies = async () => {
      try {
        setIsLoading(true);
        
        if (!user) return;

        const { data, error } = await supabase
          .from('insurance_companies')
          .select('*')
          .eq('created_by', user.id);
        
        if (error) throw error;

        // Mapeamento dos dados do banco para o formato da interface
        const mappedCompanies: InsuranceCompany[] = data.map(company => ({
          id: company.id,
          companyName: company.company_name,
          tradingName: company.trading_name,
          cnpj: company.cnpj,
          ansRegistry: company.ans_registry,
          address: {
            street: company.street,
            number: company.number,
            complement: company.complement || undefined,
            neighborhood: company.neighborhood,
            city: company.city,
            state: company.state,
            zipCode: company.zip_code,
          },
          contactInfo: {
            email: company.email,
            phone: company.phone,
            contactPerson: company.contact_person || undefined,
          },
          logoUrl: company.logo_url || undefined,
          active: company.active,
          createdAt: company.created_at,
          updatedAt: company.updated_at
        }));
        
        setInsuranceCompanies(mappedCompanies);
      } catch (error) {
        console.error("Erro ao carregar convênios:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os convênios. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInsuranceCompanies();
  }, [user]);

  const filteredCompanies = insuranceCompanies.filter(company => 
    company.tradingName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm)
  );

  const handleNewInsurance = () => {
    navigate('/insurance/new');
  };

  const handleEditInsurance = (id: string) => {
    navigate(`/insurance/${id}`);
  };

  const handleViewContracts = (id: string) => {
    navigate(`/insurance/${id}/contracts`);
  };

  const handleViewForms = (id: string) => {
    navigate(`/insurance/${id}/forms`);
  };

  const handleViewAuditRules = (id: string) => {
    navigate(`/insurance/${id}/audit-rules`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Convênios Médicos</h2>
          <p className="text-muted-foreground">
            Gerencie operadoras, contratos e configurações de convênios
          </p>
        </div>
        <Button onClick={handleNewInsurance} className="bg-cardio-500 hover:bg-cardio-600">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Convênio
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, razão social ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cardio-500" />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mb-2" />
              <h3 className="text-lg font-medium">Nenhum convênio encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente buscar com outros termos" : "Clique em 'Novo Convênio' para adicionar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Nome / Razão Social</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Registro ANS</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{company.tradingName}</div>
                          <div className="text-sm text-muted-foreground">{company.companyName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{company.cnpj}</TableCell>
                      <TableCell>{company.ansRegistry}</TableCell>
                      <TableCell>
                        {company.active ? (
                          <Badge className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewContracts(company.id)}
                            title="Contratos"
                            className="hidden md:inline-flex"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewForms(company.id)}
                            title="Formulários"
                            className="hidden md:inline-flex"
                          >
                            <File className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewAuditRules(company.id)}
                            title="Regras de Auditoria"
                            className="hidden md:inline-flex"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleEditInsurance(company.id)}
                          >
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
