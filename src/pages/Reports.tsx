
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatheterizationReportPreview } from '@/components/reports/CatheterizationReportPreview';
import { AngioplastyReportPreview } from '@/components/reports/AngioplastyReportPreview';
import { AdminReportSelection } from '@/components/reports/AdminReportSelection';

export const Reports: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Relatórios</h1>
          <p className="text-gray-500">Visualize, gere e exporte relatórios</p>
        </div>

        <Tabs defaultValue="catheterization" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="catheterization">Cateterismo</TabsTrigger>
            <TabsTrigger value="angioplasty">Angioplastia</TabsTrigger>
            <TabsTrigger value="administrative">Administrativo</TabsTrigger>
          </TabsList>

          <TabsContent value="catheterization">
            <CatheterizationReportPreview />
          </TabsContent>

          <TabsContent value="angioplasty">
            <AngioplastyReportPreview />
          </TabsContent>

          <TabsContent value="administrative">
            <AdminReportSelection />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
