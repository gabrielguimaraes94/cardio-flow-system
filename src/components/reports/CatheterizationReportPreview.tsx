
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, FileText, Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export const CatheterizationReportPreview: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<string>('');
  
  // Sample patient data
  const patients = [
    { id: '1', name: 'João Silva', date: '05/05/2025' },
    { id: '2', name: 'Maria Oliveira', date: '02/05/2025' },
    { id: '3', name: 'José Pereira', date: '28/04/2025' },
  ];

  const handlePrint = () => {
    toast.success('Enviando relatório para impressão...');
  };

  const handleDownload = () => {
    toast.success('Relatório baixado como PDF');
  };

  const handleShare = () => {
    toast.success('Opções de compartilhamento abertas');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Paciente</Label>
              <Select 
                value={selectedPatient} 
                onValueChange={setSelectedPatient}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report">Relatório</Label>
              <Select 
                value={selectedReport} 
                onValueChange={setSelectedReport}
                disabled={!selectedPatient}
              >
                <SelectTrigger id="report">
                  <SelectValue placeholder="Selecione um relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Cateterismo (05/05/2025)</SelectItem>
                  <SelectItem value="2">Cateterismo (02/05/2025)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Button disabled={!selectedReport} className="w-full" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Relatório
              </Button>
              <Button disabled={!selectedReport} variant="outline" className="w-full" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
              <Button disabled={!selectedReport} variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Visualização do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedReport ? (
              <div className="p-6 font-serif">
                <div className="text-center border-b pb-4 mb-6">
                  <h2 className="font-bold text-xl">Cardio Center</h2>
                  <p>Av. Paulista, 1000 - São Paulo, SP</p>
                  <p>Tel: (11) 3000-0000 | Email: contato@cardiocenter.com.br</p>
                </div>
                
                <h1 className="text-center text-xl font-bold mb-6">RELATÓRIO DE CATETERISMO CARDÍACO</h1>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p><strong>Paciente:</strong> João Silva</p>
                    <p><strong>Idade:</strong> 65 anos</p>
                    <p><strong>Data:</strong> 05/05/2025</p>
                  </div>
                  <div>
                    <p><strong>Médico:</strong> Dr. Carlos Silva</p>
                    <p><strong>CRM:</strong> 12345-SP</p>
                    <p><strong>Convênio:</strong> Unimed</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold mb-2">DIAGNÓSTICO</h3>
                  <div className="pl-4">
                    <p className="mb-2"><strong>Coronária Direita (CD):</strong> Moderado</p>
                    <p className="pl-4 mb-4">Apresenta lesões Moderadas, de característica Focal, localizada em segmento Proximal, com estenose de aproximadamente 70%.</p>
                    
                    <p className="mb-2"><strong>Descendente Anterior (DA):</strong> Importante</p>
                    <p className="pl-4 mb-4">Apresenta lesões Graves, de característica Difusa, localizada em segmento Médio, com estenose de aproximadamente 85%.</p>
                    
                    <p className="mb-2"><strong>Circunflexa (CX):</strong> Pequeno</p>
                    <p className="pl-4">Sem lesões significativas.</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold mb-2">CONCLUSÃO</h3>
                  <p className="pl-4">
                    Paciente apresenta doença aterosclerótica coronariana bi-arterial, acometendo CD e DA,
                    com lesões significativas que necessitam de intervenção.
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold mb-2">RECOMENDAÇÕES</h3>
                  <p className="pl-4">
                    Sugere-se angioplastia coronariana com implante de stent farmacológico.
                  </p>
                </div>
                
                <div className="mt-12 text-center">
                  <div className="border-t border-black pt-2 w-64 mx-auto">
                    <p>Dr. Carlos Silva</p>
                    <p>CRM: 12345-SP</p>
                  </div>
                </div>
                
                <div className="text-center mt-16 text-xs text-gray-500 border-t pt-4">
                  <p>Cardio Center - CNPJ: 00.000.000/0001-00</p>
                  <p>Certificado Digital: ABC123456789</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[600px] text-gray-400">
                <p>Selecione um relatório para visualizar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
