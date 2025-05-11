
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '@/types/profile';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
  user: UserProfile | null;
}

// Create validation schema with the exact same structure as UserProfile
const userSchema = yup.object({
  id: yup.string(),
  firstName: yup.string().required('Nome é obrigatório'),
  lastName: yup.string().required('Sobrenome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  crm: yup.string().required('CRM é obrigatório'),
  role: yup.string().oneOf(['admin', 'doctor', 'nurse', 'receptionist', 'staff'], 'Perfil inválido').required('Perfil é obrigatório'),
  title: yup.string().optional(),
  bio: yup.string().optional(),
  phone: yup.string().nullable().optional()
}).required();

type UserFormData = yup.InferType<typeof userSchema>;

export const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, onSave, user }) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<UserProfile>({
    resolver: yupResolver<UserProfile>(userSchema)
  });

  // Reset form when user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset(user);
      } else {
        reset({
          id: '',
          firstName: '',
          lastName: '',
          email: '',
          crm: '',
          role: 'doctor',
          title: '',
          bio: '',
          phone: null
        });
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = (data: UserProfile) => {
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
              <Label htmlFor="firstName">Nome</Label>
              <Input 
                id="firstName" 
                {...register("firstName")} 
                placeholder="Nome"
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input 
                id="lastName" 
                {...register("lastName")} 
                placeholder="Sobrenome"
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                placeholder="usuario@exemplo.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="crm">CRM</Label>
              <Input 
                id="crm" 
                {...register("crm")} 
                placeholder="CRM"
              />
              {errors.crm && <p className="text-sm text-red-500">{errors.crm.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                {...register("phone")} 
                placeholder="Telefone"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Perfil</Label>
              <Controller
                name="role"
                control={control}
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
                        <SelectItem value="doctor">Médico</SelectItem>
                        <SelectItem value="nurse">Enfermeiro</SelectItem>
                        <SelectItem value="receptionist">Recepção</SelectItem>
                        <SelectItem value="staff">Equipe</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                {...register("title")} 
                placeholder="Ex: Cardiologista"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input 
                id="bio" 
                {...register("bio")} 
                placeholder="Breve descrição profissional"
              />
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
