
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleInsuranceCompany } from '@/types/insurance-selector';
import { v4 as uuidv4 } from 'uuid';

interface InsuranceSelectorProps {
  onInsuranceSelect: (insurance: SimpleInsuranceCompany) => void;
  selectedInsurance: SimpleInsuranceCompany | null;
}

export const InsuranceSelector: React.FC<InsuranceSelectorProps> = ({ 
  onInsuranceSelect, 
  selectedInsurance 
}) => {
  const [insuranceCompanies] = useState<SimpleInsuranceCompany[]>([
    { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Bradesco Saúde', requiresDigitalSubmission: true },
    { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', name: 'Amil', requiresDigitalSubmission: true },
    { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481', name: 'Unimed', requiresDigitalSubmission: false },
    { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d482', name: 'SulAmérica', requiresDigitalSubmission: true }
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
