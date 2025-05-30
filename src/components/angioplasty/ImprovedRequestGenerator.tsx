
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TussCode } from './TussCodeList';
import { MaterialWithQuantity } from '@/types/material';
import { toast } from 'sonner';
import { PDFViewer } from './PDFViewer';
import { PDFActions } from './PDFActions';
import { useClinic } from '@/contexts/ClinicContext';
import { PatientSelector, Patient } from './PatientSelector';
import { format } from 'date-fns';
import { SimpleInsuranceCompany } from '@/types/insurance-selector';
import { Clinic } from '@/types/clinic';
import { 
  RequestFormValues, 
  requestFormSchema, 
  SurgicalTeam 
} from '@/types/angioplasty-request';
import { BasicInformationForm } from './forms/BasicInformationForm';
import { ClinicalInformationForm } from './forms/ClinicalInformationForm';
import { ProceduresAndMaterialsForm } from './forms/ProceduresAndMaterialsForm';
import { useAngioplastyFormValidation } from '@/hooks/useAngioplastyFormValidation';

export const ImprovedRequestGenerator: React.FC = () => {
  const { selectedClinic } = useClinic();
  const { validateForm } = useAngioplastyFormValidation();
  const [currentTab, setCurrentTab] = useState<string>('form');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<SimpleInsuranceCompany | null>(null);
  const [selectedProcedures, setSelectedProcedures] = useState<TussCode[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialWithQuantity[]>([]);
  const [surgicalTeam, setSurgicalTeam] = useState<SurgicalTeam>({
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
    const isValid = validateForm({
      values,
      selectedProcedures,
      surgicalTeam,
    });

    if (!isValid) {
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
                <BasicInformationForm
                  form={form}
                  requestNumber={requestNumber}
                  setRequestNumber={setRequestNumber}
                  onPatientSelect={handlePatientSelect}
                  onInsuranceSelect={handleInsuranceSelect}
                  selectedInsurance={selectedInsurance}
                />

                <ProceduresAndMaterialsForm
                  selectedProcedures={selectedProcedures}
                  selectedMaterials={selectedMaterials}
                  surgicalTeam={surgicalTeam}
                  onAddProcedure={handleAddProcedure}
                  onRemoveProcedure={handleRemoveProcedure}
                  onAddMaterial={handleAddMaterial}
                  onRemoveMaterial={handleRemoveMaterial}
                  onUpdateMaterialQuantity={handleUpdateMaterialQuantity}
                  setSurgicalTeam={setSurgicalTeam}
                />
              </div>

              <div className="space-y-6">
                <ClinicalInformationForm form={form} />

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
