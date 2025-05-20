
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { ImprovedRequestGenerator } from '@/components/angioplasty/ImprovedRequestGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClinic } from '@/contexts/ClinicContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

export const Angioplasty = () => {
  const { selectedClinic, clinics, loading } = useClinic();
  const [hasClinic, setHasClinic] = useState(false);
  
  // Verifica se existe uma clínica selecionada ou disponível
  useEffect(() => {
    setHasClinic(Boolean(selectedClinic));
  }, [selectedClinic, clinics]);

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Solicitação de Angioplastia</h1>
          <p className="text-gray-500">Gere solicitações de angioplastia para convênios</p>
        </div>
        
        {!loading && !hasClinic && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              Você precisa selecionar uma clínica antes de gerar uma solicitação de angioplastia.
              Por favor, selecione uma clínica no seletor na parte superior da página.
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Gerador de Solicitações</CardTitle>
          </CardHeader>
          <CardContent>
            <ImprovedRequestGenerator />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Angioplasty;
