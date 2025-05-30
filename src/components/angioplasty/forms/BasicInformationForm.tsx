
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PatientSelector, Patient } from '@/components/angioplasty/PatientSelector';
import { InsuranceSelector } from '@/components/angioplasty/InsuranceSelector';
import { RequestFormValues } from '@/types/angioplasty-request';
import { SimpleInsuranceCompany } from '@/types/insurance-selector';

interface BasicInformationFormProps {
  form: UseFormReturn<RequestFormValues>;
  requestNumber: string;
  setRequestNumber: (value: string) => void;
  onPatientSelect: (patient: Patient) => void;
  onInsuranceSelect: (insurance: SimpleInsuranceCompany) => void;
  selectedInsurance: SimpleInsuranceCompany | null;
}

export const BasicInformationForm: React.FC<BasicInformationFormProps> = ({
  form,
  requestNumber,
  setRequestNumber,
  onPatientSelect,
  onInsuranceSelect,
  selectedInsurance,
}) => {
  return (
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
                    onPatientSelect={onPatientSelect} 
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
                    onInsuranceSelect={onInsuranceSelect}
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
  );
};
