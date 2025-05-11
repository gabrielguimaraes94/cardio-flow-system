
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';

interface InsuranceCompany {
  id: string;
  company_name: string;
  trading_name: string;
  cnpj: string;
  active: boolean;
  logo_url?: string;
  created_at: string;
}

export const InsuranceSettings: React.FC = () => {
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedClinic } = useClinic();
  const { user } = useAuth();

  useEffect(() => {
    const fetchInsuranceCompanies = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const query = supabase
          .from('insurance_companies')
          .select('*')
          .eq('created_by', user.id);
          
        if (selectedClinic) {
          query.eq('clinic_id', selectedClinic.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setInsuranceCompanies(data || []);
      } catch (error: any) {
        console.error('Erro ao buscar convênios:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os convênios',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsuranceCompanies();
  }, [user, selectedClinic, toast]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Convênios</h3>
          <Button 
            onClick={() => navigate('/insurance/new')}
            className="bg-cardio-500 hover:bg-cardio-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Convênio
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cardio-500"></div>
          </div>
        ) : insuranceCompanies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insuranceCompanies.map((insurance) => (
                <TableRow key={insurance.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                      {insurance.logo_url ? (
                        <img src={insurance.logo_url} alt={insurance.trading_name} className="h-full w-full object-contain" />
                      ) : (
                        <Building2 className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{insurance.trading_name}</div>
                      <div className="text-sm text-gray-500">{insurance.company_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{insurance.cnpj}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${insurance.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {insurance.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/insurance/${insurance.id}`)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum convênio encontrado</h3>
            <p className="text-gray-500 mb-4">
              Você ainda não cadastrou nenhum convênio. Clique no botão acima para adicionar seu primeiro convênio.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
