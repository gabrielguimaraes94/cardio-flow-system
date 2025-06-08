
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, User, Building, FileText, Loader2 } from 'lucide-react';
import { angioplastyService, AngioplastyRequest } from '@/services/angioplastyService';
import { AngioplastyPDFViewer } from '@/components/angioplasty/AngioplastyPDFViewer';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/contexts/ClinicContext';

export const AngioplastyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedClinic } = useClinic();
  const [request, setRequest] = useState<AngioplastyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPDF, setShowPDF] = useState(true);

  useEffect(() => {
    if (id) {
      loadRequest(id);
    } else {
      navigate('/angioplasty/list');
    }
  }, [id, navigate]);

  const loadRequest = async (requestId: string) => {
    try {
      setLoading(true);
      // Por enquanto vamos buscar todas e filtrar, futuramente pode ser otimizado
      const allRequests = await angioplastyService.getAllRequests();
      const foundRequest = allRequests.find(req => req.id === requestId);
      
      if (!foundRequest) {
        toast({
          title: "Solicitação não encontrada",
          description: "A solicitação que você está tentando visualizar não foi encontrada.",
          variant: "destructive"
        });
        navigate('/angioplasty/list');
        return;
      }
      
      setRequest(foundRequest);
    } catch (error) {
      console.error('Erro ao carregar solicitação:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a solicitação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando solicitação...</span>
        </div>
      </Layout>
    );
  }

  if (!request || !selectedClinic) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>Solicitação não encontrada ou clínica não selecionada.</p>
        </div>
      </Layout>
    );
  }

  const pdfData = {
    patient: {
      id: request.patientId,
      name: request.patientName,
      birthdate: new Date().toISOString().split('T')[0] // Placeholder, idealmente viria do banco
    },
    insurance: {
      id: request.insuranceId,
      name: request.insuranceName
    },
    clinic: {
      id: selectedClinic.id,
      name: selectedClinic.name,
      address: selectedClinic.address,
      phone: selectedClinic.phone,
      email: selectedClinic.email,
      city: selectedClinic.city || 'São Paulo', // Garantir que city sempre tenha um valor
      logo_url: selectedClinic.logo_url
    },
    tussProcedures: request.tussProcedures,
    materials: request.materials,
    surgicalTeam: request.surgicalTeam,
    coronaryAngiography: request.coronaryAngiography,
    proposedTreatment: request.proposedTreatment,
    requestNumber: request.requestNumber
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/angioplasty/list')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Visualizar Solicitação
              </h1>
              <p className="text-gray-500">
                Solicitação #{request.requestNumber}
              </p>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{request.patientName}</p>
                    <p className="text-sm text-gray-500">Paciente</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{request.insuranceName}</p>
                    <p className="text-sm text-gray-500">Convênio</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatDate(request.createdAt)}</p>
                    <p className="text-sm text-gray-500">Data de criação</p>
                  </div>
                </div>

                {request.cancelledAt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium text-red-600">{formatDate(request.cancelledAt)}</p>
                      <p className="text-sm text-gray-500">Data de cancelamento</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-pdf"
                    checked={showPDF}
                    onCheckedChange={setShowPDF}
                  />
                  <Label htmlFor="show-pdf">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Mostrar PDF
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {showPDF ? (
              <AngioplastyPDFViewer 
                data={pdfData}
                showActions={request.status === 'active'}
              />
            ) : (
              <Card className="h-[600px]">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Visualização de PDF desabilitada</p>
                    <p className="text-sm">Ative o switch acima para visualizar</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AngioplastyView;
