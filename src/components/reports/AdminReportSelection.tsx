
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, LineChart, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { DatePickerWithRange } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

export const AdminReportSelection: React.FC = () => {
  const [reportType, setReportType] = useState<string>('');
  const [clinic, setClinic] = useState<string>('');
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2025, 4, 1),
    to: new Date(2025, 4, 31),
  });

  const handleGenerateReport = () => {
    toast.success('Gerando relatório administrativo...');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Administrativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Relatório</Label>
              <Select 
                value={reportType} 
                onValueChange={setReportType}
              >
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Selecione um tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="procedures">Estatísticas de Procedimentos</SelectItem>
                  <SelectItem value="insurance">Faturamento por Convênio</SelectItem>
                  <SelectItem value="revenue">Receita por Consultório</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic">Consultório</Label>
              <Select 
                value={clinic} 
                onValueChange={setClinic}
                disabled={!reportType}
              >
                <SelectTrigger id="clinic">
                  <SelectValue placeholder="Selecione um consultório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Cardio Center - São Paulo</SelectItem>
                  <SelectItem value="2">Instituto Cardiovascular - Rio de Janeiro</SelectItem>
                  <SelectItem value="3">Clínica do Coração - Belo Horizonte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Período</Label>
              <DatePickerWithRange date={date} setDate={setDate} />
            </div>

            <div className="pt-4">
              <Button 
                className="w-full" 
                disabled={!reportType || !clinic || !date?.from || !date?.to}
                onClick={handleGenerateReport}
              >
                Gerar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Favoritos</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="procedures">
                <AccordionTrigger className="text-sm">Procedimentos Mensais</AccordionTrigger>
                <AccordionContent>
                  <div className="flex justify-between text-sm py-2">
                    <span>Cardio Center</span>
                    <Button size="sm" variant="outline" onClick={() => toast.success('Relatório gerado com sucesso')}>
                      Gerar
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="billing">
                <AccordionTrigger className="text-sm">Faturamento Trimestral</AccordionTrigger>
                <AccordionContent>
                  <div className="flex justify-between text-sm py-2">
                    <span>Todos os Consultórios</span>
                    <Button size="sm" variant="outline" onClick={() => toast.success('Relatório gerado com sucesso')}>
                      Gerar
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="patients">
                <AccordionTrigger className="text-sm">Pacientes por Convênio</AccordionTrigger>
                <AccordionContent>
                  <div className="flex justify-between text-sm py-2">
                    <span>Instituto Cardiovascular</span>
                    <Button size="sm" variant="outline" onClick={() => toast.success('Relatório gerado com sucesso')}>
                      Gerar
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="border-b">
            <CardTitle>Demonstração de Relatórios</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {reportType === 'procedures' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Estatísticas de Procedimentos</h3>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border">
                  <div className="text-center p-6">
                    <BarChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Gráfico de barras mostrando a distribuição de procedimentos por tipo</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-4xl font-bold text-cardio-500">42</p>
                      <p className="text-sm text-gray-500">Cateterismos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-4xl font-bold text-cardio-500">27</p>
                      <p className="text-sm text-gray-500">Angioplastias</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-4xl font-bold text-cardio-500">15</p>
                      <p className="text-sm text-gray-500">Outros</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {reportType === 'insurance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Faturamento por Convênio</h3>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border">
                  <div className="text-center p-6">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Gráfico de pizza mostrando a distribuição de faturamento por convênio</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Unimed</span>
                    <span className="font-medium">R$ 125.000,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bradesco Saúde</span>
                    <span className="font-medium">R$ 87.500,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SulAmérica</span>
                    <span className="font-medium">R$ 62.300,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outros</span>
                    <span className="font-medium">R$ 45.200,00</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>R$ 320.000,00</span>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'revenue' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Receita por Consultório</h3>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border">
                  <div className="text-center p-6">
                    <LineChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Gráfico de linha mostrando a tendência de receita ao longo do tempo</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Consultório: Cardio Center - São Paulo</h4>
                    <p className="text-sm text-gray-500">Período: {date?.from ? format(date.from, "PPP") : "N/A"} - {date?.to ? format(date.to, "PPP") : "N/A"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Receita Total</p>
                        <p className="text-2xl font-bold">R$ 320.000,00</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Média Mensal</p>
                        <p className="text-2xl font-bold">R$ 106.666,67</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {!reportType && (
              <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                <Calendar className="h-12 w-12 mb-4" />
                <p>Selecione um tipo de relatório para visualizar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
