import React, { useState, useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TussCodeList, TussCode } from './TussCodeList';
import { MaterialsList } from './MaterialsList';
import { MaterialWithQuantity } from '@/types/material';
import { toast } from 'sonner';
import { PDFViewer } from './PDFViewer';
import { PDFActions } from './PDFActions';
import { useClinic } from '@/contexts/ClinicContext';
import { PatientSelector, Patient } from './PatientSelector';
import { SurgicalTeamSelector } from './SurgicalTeamSelector';
import { format } from 'date-fns';
import { InsuranceSelector } from './InsuranceSelector';
import { SimpleInsuranceCompany } from '@/types/insurance-selector';
import { Clinic } from '@/types/clinic';

const requestFormSchema = z.object({
  patientId: z.string().min(1, { message: 'Selecione um paciente' }),
  insuranceId: z.string().min(1, { message: 'Selecione um convênio' }),
  coronaryAngiography: z.string().min(1, { message: 'Campo obrigatório' }),
  proposedTreatment: z.string().min(1, { message: 'Campo obrigatório' }),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export const ImprovedRequestGenerator: React.FC = () => {
  const { selectedClinic } = useClinic();
  const [currentTab, setCurrentTab] = useState<string>('form');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<SimpleInsuranceCompany | null>(null);
  const [selectedProcedures, setSelectedProcedures] = useState<TussCode[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialWithQuantity[]>([]);
  const [surgicalTeam, setSurgicalTeam] = useState<any>({
    surgeon: null,
    assistant: null,
    anesthesiologist: null,
  });
  const [requestNumber, setRequestNumber] = useState<string>(
    `ANG-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  );

  const pdfContentRef = useRef<HTMLDivElement>(null);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      patientId: '',
      insuranceId: '',
      coronaryAngiography: '',
      proposedTreatment: '',
    },
  });

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    form.setValue('patientId', patient.id);
  };

  const handleInsuranceSelect = (insurance: SimpleInsuranceCompany) => {
    setSelectedInsurance(insurance);
    form.setValue('insuranceId', insurance.id);
  };

  const handleAddMaterial = (material: MaterialWithQuantity) => {
    setSelectedMaterials(prev => [...prev, material]);
  };

  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  const handleUpdateMaterialQuantity = (materialId: string, quantity: number) => {
    setSelectedMaterials(prev => 
      prev.map(m => m.id === materialId ? { ...m, quantity } : m)
    );
  };

  const handleAddProcedure = (procedure: TussCode) => {
    setSelectedProcedures(prev => [...prev, procedure]);
  };

  const handleRemoveProcedure = (procedureId: string) => {
    setSelectedProcedures(prev => prev.filter(p => p.id !== procedureId));
  };

  const handleGenerateRequest = (values: RequestFormValues) => {
    if (selectedProcedures.length === 0) {
      toast.error('Selecione pelo menos um procedimento TUSS');
      return;
    }

    if (!surgicalTeam.surgeon) {
      toast.error('Selecione um cirurgião para a equipe cirúrgica');
      return;
    }

    // Switching to the preview tab
    setCurrentTab('preview');
    toast.success('Solicitação gerada com sucesso!');
  };

  // Ensure we have a valid clinic for the PDF, providing default values for required fields
  const clinicForPDF: Clinic = selectedClinic ? {
    ...selectedClinic,
    address: selectedClinic.address || 'Endereço não informado',
    phone: selectedClinic.phone || 'Telefone não informado',
  } : {
    id: '',
    name: '',
    address: 'Endereço não informado',
    phone: 'Telefone não informado',
    city: '',
    email: '',
  };

  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="form">Formulário de Solicitação</TabsTrigger>
        <TabsTrigger value="preview">Visualizar PDF</TabsTrigger>
      </TabsList>

      <TabsContent value="form">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerateRequest)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paciente</FormLabel>
                            <FormControl>
                              <PatientSelector 
                                onPatientSelect={handlePatientSelect} 
                                selectedValue={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="insuranceId"
                        render={() => (
                          <FormItem>
                            <FormLabel>Convênio</FormLabel>
                            <FormControl>
                              <InsuranceSelector 
                                onInsuranceSelect={handleInsuranceSelect}
                                selectedInsurance={selectedInsurance}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <Label htmlFor="requestNumber">Número da Solicitação</Label>
                        <Input
                          id="requestNumber"
                          value={requestNumber}
                          onChange={(e) => setRequestNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Procedimentos TUSS</h3>
                    <TussCodeList 
                      selectedProcedures={selectedProcedures}
                      onAdd={handleAddProcedure}
                      onRemove={handleRemoveProcedure}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Materiais</h3>
                    <MaterialsList
                      selectedMaterials={selectedMaterials}
                      onAdd={handleAddMaterial}
                      onRemove={handleRemoveMaterial}
                      onUpdateQuantity={handleUpdateMaterialQuantity}
                      selectedProcedures={selectedProcedures}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Equipe Cirúrgica</h3>
                    <SurgicalTeamSelector
                      surgicalTeam={surgicalTeam}
                      setSurgicalTeam={setSurgicalTeam}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="coronaryAngiography"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coronariografia</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva os resultados da coronariografia"
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="proposedTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tratamento Proposto</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o tratamento proposto para o paciente"
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto">
                    Gerar Solicitação
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="preview">
        <div className="space-y-4">
          <Card className="bg-white">
            <CardContent className="p-0">
              <PDFViewer
                patient={selectedPatient}
                insurance={selectedInsurance}
                clinic={clinicForPDF}
                tussProcedures={selectedProcedures}
                materials={selectedMaterials}
                surgicalTeam={surgicalTeam}
                coronaryAngiography={form.getValues('coronaryAngiography')}
                proposedTreatment={form.getValues('proposedTreatment')}
                requestNumber={requestNumber}
                contentRef={pdfContentRef}
              />
            </CardContent>
          </Card>

          <PDFActions
            data={{
              patient: selectedPatient,
              insurance: selectedInsurance,
              clinic: clinicForPDF,
              tussProcedures: selectedProcedures,
              materials: selectedMaterials,
              surgicalTeam: surgicalTeam,
              coronaryAngiography: form.getValues('coronaryAngiography'),
              proposedTreatment: form.getValues('proposedTreatment'),
              requestNumber: requestNumber,
            }}
            contentRef={pdfContentRef}
          />

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setCurrentTab('form')}>
              Voltar para o Formulário
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
