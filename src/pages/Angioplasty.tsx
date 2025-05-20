
import React from 'react';
import { Layout } from '@/components/Layout';
import { ImprovedRequestGenerator } from '@/components/angioplasty/ImprovedRequestGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Angioplasty = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Solicitação de Angioplastia</h1>
          <p className="text-gray-500">Gere solicitações de angioplastia para convênios</p>
        </div>
        
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
