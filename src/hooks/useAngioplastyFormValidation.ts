
import { toast } from 'sonner';
import { RequestFormValues, SurgicalTeam } from '@/types/angioplasty-request';
import { TussCode } from '@/components/angioplasty/TussCodeList';

interface ValidationParams {
  values: RequestFormValues;
  selectedProcedures: TussCode[];
  surgicalTeam: SurgicalTeam;
}

export const useAngioplastyFormValidation = () => {
  const validateForm = ({ values, selectedProcedures, surgicalTeam }: ValidationParams): boolean => {
    // Validação customizada apenas no momento do submit
    const coronaryAngiography = values.coronaryAngiography?.trim() || '';
    const proposedTreatment = values.proposedTreatment?.trim() || '';

    if (!coronaryAngiography) {
      toast.error('Campo Coronariografia é obrigatório');
      return false;
    }

    if (!proposedTreatment) {
      toast.error('Campo Tratamento Proposto é obrigatório');
      return false;
    }

    if (selectedProcedures.length === 0) {
      toast.error('Selecione pelo menos um procedimento TUSS');
      return false;
    }

    if (!surgicalTeam.surgeon) {
      toast.error('Selecione um cirurgião para a equipe cirúrgica');
      return false;
    }

    return true;
  };

  return { validateForm };
};
