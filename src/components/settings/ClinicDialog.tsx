
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';

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

export const ClinicDialog: React.FC<ClinicDialogProps> = ({ isOpen, onClose, onSave, clinic }) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<Clinic>();

  // Reset form when clinic changes
  useEffect(() => {
    if (isOpen) {
      if (clinic) {
        reset({
          id: clinic.id,
          name: clinic.name,
          address: clinic.address,
          city: clinic.city,
          phone: clinic.phone,
          email: clinic.email,
          active: clinic.active
        });
      } else {
        reset({
          id: '',
          name: '',
          address: '',
          city: '',
          phone: '',
          email: '',
          active: true
        });
      }
    }
  }, [isOpen, clinic, reset]);

  const onSubmit = (data: Clinic) => {
    onSave({
      ...data,
      id: clinic?.id || Date.now().toString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{clinic ? 'Editar Clínica' : 'Nova Clínica'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Clínica</Label>
              <Input 
                id="name" 
                {...register("name", { required: "Nome é obrigatório" })} 
                placeholder="Nome da clínica"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input 
                id="address" 
                {...register("address", { required: "Endereço é obrigatório" })} 
                placeholder="Endereço completo"
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="city">Cidade</Label>
              <Input 
                id="city" 
                {...register("city", { required: "Cidade é obrigatória" })} 
                placeholder="Cidade"
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                {...register("phone", { required: "Telefone é obrigatório" })} 
                placeholder="(00) 0000-0000"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                {...register("email", { 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })} 
                placeholder="contato@clinica.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="flex items-center space-x-2">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="active" className="font-normal">Clínica ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
