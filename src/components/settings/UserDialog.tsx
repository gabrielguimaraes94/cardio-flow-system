
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type UserRole = 'admin' | 'clinic_admin' | 'doctor' | 'nurse' | 'receptionist';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinics: string[];
  active: boolean;
}

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
}

export const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, onSave, user }) => {
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<User>();

  // Available clinics
  const availableClinics = [
    { id: '1', name: 'Cardio Center' },
    { id: '2', name: 'Instituto Cardiovascular' },
    { id: '3', name: 'Clínica do Coração' },
  ];

  // Reset form when user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          clinics: user.clinics,
          active: user.active
        });
      } else {
        reset({
          id: '',
          name: '',
          email: '',
          role: 'doctor',
          clinics: [],
          active: true
        });
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = (data: User) => {
    onSave({
      ...data,
      id: user?.id || Date.now().toString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                {...register("name", { required: "Nome é obrigatório" })} 
                placeholder="Nome completo"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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
                placeholder="usuario@exemplo.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Perfil</Label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Perfil é obrigatório" }}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="clinic_admin">Administrador de Clínica</SelectItem>
                        <SelectItem value="doctor">Médico</SelectItem>
                        <SelectItem value="nurse">Enfermeiro</SelectItem>
                        <SelectItem value="receptionist">Recepção</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label>Clínicas</Label>
              <div className="grid gap-2 border p-4 rounded-md max-h-40 overflow-y-auto">
                {availableClinics.map((clinic) => (
                  <div key={clinic.id} className="flex items-center space-x-2">
                    <Controller
                      name="clinics"
                      control={control}
                      defaultValue={[]}
                      render={({ field }) => (
                        <Checkbox
                          id={`clinic-${clinic.id}`}
                          checked={field.value?.includes(clinic.name)}
                          onCheckedChange={(checked) => {
                            const updatedClinics = checked
                              ? [...(field.value || []), clinic.name]
                              : (field.value || []).filter(c => c !== clinic.name);
                            setValue('clinics', updatedClinics);
                          }}
                        />
                      )}
                    />
                    <Label htmlFor={`clinic-${clinic.id}`} className="font-normal">
                      {clinic.name}
                    </Label>
                  </div>
                ))}
              </div>
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
              <Label htmlFor="active" className="font-normal">Usuário ativo</Label>
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
