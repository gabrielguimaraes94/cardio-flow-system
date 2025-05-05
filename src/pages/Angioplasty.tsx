
import React from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TussCodeList } from '@/components/angioplasty/TussCodeList';
import { MaterialsList } from '@/components/angioplasty/MaterialsList';
import { RequestGenerator } from '@/components/angioplasty/RequestGenerator';

export const Angioplasty = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Solicitação de Angioplastia</h1>
        
        <Tabs defaultValue="tuss" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="tuss">Códigos TUSS</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="generator">Gerar Solicitação</TabsTrigger>
          </TabsList>

          <TabsContent value="tuss" className="p-4 bg-white rounded-md border">
            <TussCodeList />
          </TabsContent>

          <TabsContent value="materials" className="p-4 bg-white rounded-md border">
            <MaterialsList />
          </TabsContent>

          <TabsContent value="generator" className="p-4 bg-white rounded-md border">
            <RequestGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Angioplasty;
