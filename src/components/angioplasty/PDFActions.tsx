
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Printer, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AngioplastyRequest, angioplastyService } from '@/services/angioplastyService';
import { useAuth } from '@/contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [isDownloading, setIsDownloading] = useState(false);
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

      const result = await angioplastyService.saveRequest(requestData);

      if (result) {
        toast({
          title: "Solicitação salva",
          description: "A solicitação foi salva com sucesso no histórico do paciente."
        });
      } else {
        throw new Error("Falha ao salvar solicitação");
      }
    } catch (error) {
      console.error('Error saving request:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a solicitação. Por favor, tente novamente.",
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

  const handleDownload = async () => {
    if (!contentRef.current) {
      toast({
        title: "Erro ao baixar",
        description: "Conteúdo não disponível para download",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      // Create a PDF from the content
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate image dimensions to fit A4 page
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Generate filename with patient name and date
      const patientName = data.patient ? data.patient.name.replace(/[^a-zA-Z0-9]/g, '_') : 'angioplastia';
      const date = new Date().toISOString().split('T')[0];
      const filename = `Solicitacao_Angioplastia_${patientName}_${date}.pdf`;

      pdf.save(filename);

      toast({
        title: "Download concluído",
        description: "O PDF foi salvo com sucesso."
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Erro ao baixar PDF",
        description: "Não foi possível gerar o PDF. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
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

      <Button 
        variant="default" 
        className="flex items-center gap-2 print:hidden"
        disabled={!isDataComplete || isDownloading}
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" />
        {isDownloading ? "Gerando PDF..." : "Baixar PDF"}
      </Button>
    </div>
  );
};
