
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
import { Textarea } from '@/components/ui/textarea';
import { RequestFormValues } from '@/types/angioplasty-request';

interface ClinicalInformationFormProps {
  form: UseFormReturn<RequestFormValues>;
}

export const ClinicalInformationForm: React.FC<ClinicalInformationFormProps> = ({
  form,
}) => {
  return (
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
    </div>
  );
};
