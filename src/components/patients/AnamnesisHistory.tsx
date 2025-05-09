
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface AnamnesisRecord {
  id: string;
  date: string;
  doctor: string;
}

interface AnamnesisHistoryProps {
  patientName: string;
  patientId: string;
  anamnesisRecords: AnamnesisRecord[];
  onBackClick: () => void;
}

export const AnamnesisHistory: React.FC<AnamnesisHistoryProps> = ({
  patientName,
  patientId,
  anamnesisRecords,
  onBackClick
}) => {
  const navigate = useNavigate();

  const handleViewAnamnesis = (anamnesisId: string) => {
    navigate(`/patients/${patientId}/anamnesis/${anamnesisId}`);
  };

  const handleNewAnamnesis = () => {
    navigate(`/patients/${patientId}/anamnesis/new`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Histórico de Anamneses - {patientName}</CardTitle>
        <Button variant="outline" size="sm" onClick={onBackClick}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </CardHeader>
      <CardContent>
        {anamnesisRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhuma anamnese registrada para este paciente.</p>
            <Button onClick={handleNewAnamnesis}>Criar Nova Anamnese</Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={handleNewAnamnesis}>Nova Anamnese</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anamnesisRecords
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{record.doctor}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewAnamnesis(record.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Visualizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
};
