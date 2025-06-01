
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AngioplastyRequest, angioplastyService } from '@/services/angioplastyService';
import { useAuth } from '@/contexts/AuthContext';

interface PDFActionsProps {
  data: {
    patient: { id: string; name: string; birthdate: string; } | null;
    insurance: { id: string; name: string; } | null;
    clinic: { id: string; name: string; address: string; phone: string; logo_url?: string; city?: string; };
    tussProcedures: Array<{ id: string; code: string; description: string; }>;
    materials: Array<{ id: string; description: string; quantity: number; }>;
    surgicalTeam: {
      surgeon: { id: string; name: string; crm: string; } | null;
      assistant: { id: string; name: string; crm: string; } | null;
      anesthesiologist: { id: string; name: string; crm: string; } | null;
    };
    coronaryAngiography: string;
    proposedTreatment: string;
    requestNumber: string;
  };
  contentRef: React.RefObject<HTMLDivElement>;
}

export const PDFActions: React.FC<PDFActionsProps> = ({ data, contentRef }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!data.patient || !data.insurance || !user) {
      toast({
        title: "Erro ao salvar",
        description: "Dados incompletos. Verifique se paciente e convênio foram selecionados.",
        variant: "destructive"
      });
      return;
    }

    console.log('🚀 Iniciando salvamento da solicitação...');
    console.log('📋 Dados do paciente:', data.patient);
    console.log('🏥 Dados do convênio:', data.insurance);
    console.log('🏢 Dados da clínica:', data.clinic);

    setIsSaving(true);
    try {
      const requestData: Omit<AngioplastyRequest, 'id' | 'createdAt'> = {
        patientId: data.patient.id,
        patientName: data.patient.name,
        insuranceId: data.insurance.id,
        insuranceName: data.insurance.name,
        clinicId: data.clinic.id,
        requestNumber: data.requestNumber,
        coronaryAngiography: data.coronaryAngiography,
        proposedTreatment: data.proposedTreatment,
        tussProcedures: data.tussProcedures,
        materials: data.materials,
        surgicalTeam: data.surgicalTeam,
        createdBy: user.id
      };

      console.log('📦 Dados preparados para salvamento:', requestData);

      const result = await angioplastyService.saveRequest(requestData);

      if (result) {
        console.log('✅ Solicitação salva com sucesso!');
        toast({
          title: "Solicitação salva",
          description: "A solicitação foi salva com sucesso no histórico do paciente."
        });
      } else {
        throw new Error("Falha ao salvar solicitação");
      }
    } catch (error) {
      console.error('❌ Erro detalhado ao salvar:', error);
      
      let errorMessage = "Não foi possível salvar a solicitação. Por favor, tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('UUID') || error.message.includes('uuid')) {
          errorMessage = "Erro de validação: ID do convênio inválido. Tente selecionar o convênio novamente.";
        } else if (error.message.includes('ID do convênio inválido')) {
          errorMessage = "ID do convênio inválido. Tente selecionar o convênio novamente.";
        } else if (error.message.includes('Convênio não encontrado')) {
          errorMessage = "Convênio selecionado não foi encontrado. Tente selecionar outro convênio.";
        } else if (error.message.includes('foreign key constraint')) {
          errorMessage = "Erro de referência: dados do convênio ou paciente não encontrados. Verifique os dados selecionados.";
        }
      }
      
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      try {
        if (!contentRef.current) {
          throw new Error("Conteúdo não disponível para impressão");
        }
        window.print();
      } catch (error) {
        console.error('Error printing:', error);
        toast({
          title: "Erro ao imprimir",
          description: "Não foi possível imprimir o documento. Por favor, tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsPrinting(false);
      }
    }, 100);
  };

  const isDataComplete = Boolean(data.patient && data.insurance);

  return (
    <div className="flex flex-wrap gap-2 justify-end mt-4">
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        disabled={!isDataComplete || isSaving}
        onClick={handleSave}
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Salvando..." : "Salvar"}
      </Button>

      <Button 
        variant="outline" 
        className="flex items-center gap-2 print:hidden"
        disabled={!isDataComplete || isPrinting}
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4" />
        {isPrinting ? "Imprimindo..." : "Imprimir"}
      </Button>
    </div>
  );
};
