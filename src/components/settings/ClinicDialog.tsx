
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Printer, Download, Save } from 'lucide-react';

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  active: boolean;
  logo_url?: string;
}

interface ClinicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clinic: Clinic) => void;
  clinic: Clinic | null;
}

// Define o schema de validação com zod
const clinicSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  active: z.boolean().default(true),
  logo_url: z.string().optional()
});

// Define o tipo de dados para o formulário usando InferType
type ClinicFormData = z.infer<typeof clinicSchema>;

export const ClinicDialog: React.FC<ClinicDialogProps> = ({ isOpen, onClose, onSave, clinic }) => {
  const [logo, setLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      active: true,
      logo_url: ''
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
          active: clinic.active,
          logo_url: clinic.logo_url || ''
        });
        setPreviewUrl(clinic.logo_url || null);
      } else {
        form.reset({
          name: '',
          address: '',
          city: '',
          phone: '',
          email: '',
          active: true,
          logo_url: ''
        });
        setPreviewUrl(null);
      }
      setLogo(null);
    }
  }, [isOpen, clinic, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setLogo(file);
      
      // Create preview URL for the image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logo) return form.getValues('logo_url') || null;
    
    setIsUploading(true);
    try {
      // Create a unique filename for the logo
      const fileExt = logo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `clinic-logos/${fileName}`;
      
      // Upload the file directly to the existing bucket
      const { data, error } = await supabase.storage
        .from('clinic-assets')
        .upload(filePath, logo, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('clinic-assets')
        .getPublicUrl(filePath);
      
      console.log('Logo uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erro ao fazer upload do logo",
        description: "Não foi possível fazer o upload da imagem. Por favor, tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ClinicFormData) => {
    try {
      setIsUploading(true);
      
      // If there's a new logo, upload it first
      let logoUrl = data.logo_url;
      
      if (logo) {
        const uploadedUrl = await uploadLogo();
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          // If upload failed, don't proceed
          return;
        }
      }
      
      // Call onSave with the updated logo URL
      onSave({
        id: clinic?.id || '',
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
        active: data.active,
        logo_url: logoUrl
      });
      
    } catch (error) {
      console.error('Error saving clinic:', error);
      toast({
        title: "Erro ao salvar a clínica",
        description: "Ocorreu um erro ao salvar os dados da clínica.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
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
            
            {/* Logo Upload Field */}
            <div className="space-y-2">
              <FormLabel>Logo da Clínica</FormLabel>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {previewUrl && (
                  <div className="w-24 h-24 rounded border overflow-hidden bg-gray-50">
                    <img 
                      src={previewUrl} 
                      alt="Logo preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos recomendados: PNG, JPG. Tamanho máximo: 5MB.
                  </p>
                </div>
              </div>
            </div>
            
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
              <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
