
import React, { useRef } from 'react';
import { PDFViewer } from './PDFViewer';
import { PDFActions } from './PDFActions';
import { Card, CardContent } from '@/components/ui/card';

interface AngioplastyPDFViewerProps {
  data: {
    patient: { id: string; name: string; birthdate: string; } | null;
    insurance: { id: string; name: string; } | null;
    clinic: { id: string; name: string; address: string; phone: string; email: string; logo_url?: string; city?: string; };
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
  showActions?: boolean;
  className?: string;
}

export const AngioplastyPDFViewer: React.FC<AngioplastyPDFViewerProps> = ({ 
  data, 
  showActions = true,
  className = ""
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Card className={`h-full ${className}`}>
      <CardContent className="p-0 h-full">
        <div className="h-full flex flex-col">
          <PDFViewer
            patient={data.patient}
            insurance={data.insurance}
            clinic={data.clinic}
            tussProcedures={data.tussProcedures}
            materials={data.materials}
            surgicalTeam={data.surgicalTeam}
            coronaryAngiography={data.coronaryAngiography}
            proposedTreatment={data.proposedTreatment}
            requestNumber={data.requestNumber}
            contentRef={contentRef}
          />
          {showActions && (
            <div className="p-4 border-t bg-gray-50">
              <PDFActions 
                data={data}
                contentRef={contentRef}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
