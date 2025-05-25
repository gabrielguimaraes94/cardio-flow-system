
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { patientService } from '@/services/patientService';
import { anamnesisService } from '@/services/anamnesisService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryRecord {
  id: string;
  date: string;
  doctor: string;
  type: 'anamnesis' | 'catheterization' | 'angioplasty';
  title?: string;
  description?: string;
}

export const PatientHistory: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { selectedPatient, setSelectedPatient } = usePatient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [anamnesisRecords, setAnamnesisRecords] = useState<HistoryRecord[]>([]);
  const [catheterizationRecords, setCatheterizationRecords] = useState<HistoryRecord[]>([]);
  const [angioplastyRecords, setAngioplastyRecords] = useState<HistoryRecord[]>([]);

  // Carrega dados do paciente se não estiver já selecionado
  useEffect(() => {
    const fetchPatientData = async () => {
      if (patientId && (!selectedPatient || selectedPatient.id !== patientId)) {
        try {
          const { patient } = await patientService.getPatientById(patientId);
          if (patient) {
            setSelectedPatient({
              ...patient,
              age: patient.birthdate ? new Date().getFullYear() - new Date(patient.birthdate).getFullYear() : undefined
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do paciente:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do paciente.",
            variant: "destructive"
          });
        }
      }
    };

    fetchPatientData();
  }, [patientId, selectedPatient, setSelectedPatient, toast]);

  // Carrega histórico dos exames
  useEffect(() => {
    const fetchHistory = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        // Buscar anamneses reais do banco de dados
        const { anamnesis } = await anamnesisService.getPatientAnamnesis(patientId);
        
        const realAnamnesisRecords: HistoryRecord[] = anamnesis.map((item) => ({
          id: item.id,
          date: item.created_at,
          doctor: item.doctor_name || 'Dr. Não informado',
          type: 'anamnesis',
          title: 'Anamnese Cardiológica',
          description: `Avaliação realizada em ${format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR })}`
        }));

        setAnamnesisRecords(realAnamnesisRecords);

        // TODO: Implementar busca real dos dados de cateterismo e angioplastia
        // Por enquanto, dados mock para cateterismo e angioplastia
        const mockCatheterizationRecords: HistoryRecord[] = [
          {
            id: '3',
            date: '2024-03-10',
            doctor: 'Dr. Oliveira',
            type: 'catheterization',
            title: 'Cateterismo Diagnóstico',
            description: 'Exame para avaliação das artérias coronárias'
          }
        ];

        const mockAngioplastyRecords: HistoryRecord[] = [
          {
            id: '4',
            date: '2024-03-15',
            doctor: 'Dr. Oliveira',
            type: 'angioplasty',
            title: 'Angioplastia Coronariana',
            description: 'Procedimento terapêutico na artéria descendente anterior'
          }
        ];

        setCatheterizationRecords(mockCatheterizationRecords);
        setAngioplastyRecords(mockAngioplastyRecords);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o histórico do paciente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId, toast]);

  const handleBack = () => {
    navigate('/patients');
  };

  const handleViewRecord = (record: HistoryRecord) => {
    if (record.type === 'anamnesis') {
      // Navegar para visualizar a anamnese específica
      navigate(`/patients/${patientId}/anamnesis/${record.id}`);
    } else {
      // TODO: Implementar visualização dos outros tipos de exame
      toast({
        title: "Visualização",
        description: `Abrindo ${record.title} de ${format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}`,
      });
    }
  };

  const renderRecordsList = (records: HistoryRecord[], emptyMessage: string) => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (records.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleViewRecord(record)}>
            <CardHeader>
              <CardTitle className="text-lg">{record.title}</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {record.doctor}
                </span>
              </CardDescription>
            </CardHeader>
            {record.description && (
              <CardContent>
                <p className="text-sm text-gray-600">{record.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  };

  if (loading || !selectedPatient) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Histórico - {selectedPatient.name}</h1>
            <p className="text-gray-600">
              CPF: {selectedPatient.cpf} • {selectedPatient.age} anos
            </p>
          </div>
        </div>

        <Tabs defaultValue="anamnesis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
            <TabsTrigger value="catheterization">Cateterismo</TabsTrigger>
            <TabsTrigger value="angioplasty">Angioplastia</TabsTrigger>
          </TabsList>
          
          <TabsContent value="anamnesis" className="mt-6">
            {renderRecordsList(anamnesisRecords, "Nenhuma anamnese encontrada para este paciente.")}
          </TabsContent>
          
          <TabsContent value="catheterization" className="mt-6">
            {renderRecordsList(catheterizationRecords, "Nenhum cateterismo encontrado para este paciente.")}
          </TabsContent>
          
          <TabsContent value="angioplasty" className="mt-6">
            {renderRecordsList(angioplastyRecords, "Nenhuma angioplastia encontrada para este paciente.")}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
