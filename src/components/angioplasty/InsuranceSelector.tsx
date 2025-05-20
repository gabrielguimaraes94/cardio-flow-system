
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleInsuranceCompany } from '@/types/insurance-selector';

interface InsuranceSelectorProps {
  onInsuranceSelect: (insurance: SimpleInsuranceCompany) => void;
  selectedInsurance: SimpleInsuranceCompany | null;
}

export const InsuranceSelector: React.FC<InsuranceSelectorProps> = ({ 
  onInsuranceSelect, 
  selectedInsurance 
}) => {
  const [insuranceCompanies] = useState<SimpleInsuranceCompany[]>([
    { id: '1', name: 'Bradesco Saúde', requiresDigitalSubmission: true },
    { id: '2', name: 'Amil', requiresDigitalSubmission: true },
    { id: '3', name: 'Unimed', requiresDigitalSubmission: false },
    { id: '4', name: 'SulAmérica', requiresDigitalSubmission: true }
  ]);

  const handleInsuranceSelect = (insuranceId: string) => {
    const insurance = insuranceCompanies.find(i => i.id === insuranceId);
    if (insurance) {
      onInsuranceSelect(insurance);
    }
  };

  return (
    <Select value={selectedInsurance?.id || ''} onValueChange={handleInsuranceSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um convênio" />
      </SelectTrigger>
      <SelectContent>
        {insuranceCompanies.map(insurance => (
          <SelectItem key={insurance.id} value={insurance.id}>
            {insurance.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
