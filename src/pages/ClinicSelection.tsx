
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '@/contexts/ClinicContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MapPin } from 'lucide-react';
import { Clinic } from '@/types/clinic';
import { useToast } from '@/hooks/use-toast';

export const ClinicSelection: React.FC = () => {
  const { clinics, selectedClinic, setSelectedClinic, loading } = useClinic();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Limpa a clínica selecionada sempre que entrar nesta página
  useEffect(() => {
    console.log('ClinicSelection: Limpando clínica selecionada ao entrar na página');
    setSelectedClinic(null);
  }, [setSelectedClinic]);

  // Apenas redireciona em casos de erro (sem clínicas)
  useEffect(() => {
    if (!loading && clinics.length === 0) {
      console.log('ClinicSelection: Nenhuma clínica encontrada, redirecionando para no-access');
      navigate('/no-access', { replace: true });
    }
  }, [clinics, loading, navigate]);

  const handleSelectClinic = (clinic: Clinic) => {
    console.log('ClinicSelection: Selecionando clínica:', clinic.name);
    setSelectedClinic(clinic);
    toast({
      title: "Clínica selecionada",
      description: `Você agora está acessando ${clinic.name}.`,
    });
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cardio-500 mb-4"></div>
        <p className="text-gray-600">Carregando clínicas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-cardio-500 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">CardioFlow</h1>
              <p className="text-cardio-100">Sistema de Gestão Cardiológica</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Selecione uma Clínica
            </h2>
            <p className="text-gray-600">
              Você tem acesso a múltiplas clínicas. Selecione uma para continuar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => (
              <Card 
                key={clinic.id} 
                className="transition-all duration-200 cursor-pointer border-2 border-gray-200 hover:border-cardio-300 hover:shadow-md"
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={clinic.logo_url} alt={`${clinic.name} Logo`} />
                      <AvatarFallback className="bg-cardio-500 text-white text-xl">
                        {clinic.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{clinic.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {clinic.city}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Endereço:</strong> {clinic.address}</p>
                    <p><strong>Telefone:</strong> {clinic.phone}</p>
                    {clinic.email && <p><strong>Email:</strong> {clinic.email}</p>}
                  </div>
                  <Button 
                    className="w-full bg-cardio-500 hover:bg-cardio-600"
                    onClick={() => handleSelectClinic(clinic)}
                  >
                    Selecionar Clínica
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {clinics.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Nenhuma Clínica Encontrada
                  </h3>
                  <p className="text-yellow-700">
                    Você não tem acesso a nenhuma clínica no momento. 
                    Entre em contato com o administrador do sistema.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
