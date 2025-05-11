
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  active: boolean;
}

interface ClinicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clinic: Clinic) => void;
  clinic: Clinic | null;
}

// Define ClinicFormData with all fields marked as required to match Yup schema
type ClinicFormData = {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  active: boolean;
};

// Schema de validação com yup - ensuring all fields required in ClinicFormData match
const clinicSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  address: yup.string().required('Endereço é obrigatório'),
  city: yup.string().required('Cidade é obrigatória'),
  phone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  active: yup.boolean().default(true)
});

export const ClinicDialog: React.FC<ClinicDialogProps> = ({ isOpen, onClose, onSave, clinic }) => {
  const form = useForm<ClinicFormData>({
    resolver: yupResolver(clinicSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      active: true
    }
  });

  // Reset form when clinic changes
  useEffect(() => {
    if (isOpen) {
      if (clinic) {
        form.reset({
          name: clinic.name,
          address: clinic.address,
          city: clinic.city,
          phone: clinic.phone,
          email: clinic.email,
          active: clinic.active
        });
      } else {
        form.reset({
          name: '',
          address: '',
          city: '',
          phone: '',
          email: '',
          active: true
        });
      }
    }
  }, [isOpen, clinic, form]);

  const onSubmit = (data: ClinicFormData) => {
    onSave({
      ...data,
      id: clinic?.id || '', // O ID será gerado pelo Supabase para novas clínicas
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{clinic ? 'Editar Clínica' : 'Nova Clínica'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Clínica</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da clínica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 0000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contato@clinica.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Clínica ativa</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
