
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
        console.log('=== CARREGANDO CLÍNICA NO DIALOG ===');
        console.log('Dados da clínica:', clinic);
        console.log('Logo URL da clínica:', clinic.logo_url);
        
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
      console.log('=== ARQUIVO SELECIONADO ===');
      console.log('Nome do arquivo:', file.name);
      console.log('Tipo do arquivo:', file.type);
      console.log('Tamanho do arquivo:', file.size);
      
      setLogo(file);
      
      // Create preview URL for the image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const result = fileReader.result as string;
        console.log('Preview URL criada:', result.substring(0, 100) + '...');
        setPreviewUrl(result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logo) {
      const currentUrl = form.getValues('logo_url');
      console.log('=== SEM NOVO ARQUIVO, MANTENDO URL ATUAL ===');
      console.log('URL atual:', currentUrl);
      return currentUrl || null;
    }
    
    setIsUploading(true);
    try {
      console.log('=== INICIANDO UPLOAD DO LOGO ===');
      
      // Create a unique filename for the logo
      const fileExt = logo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `clinic-logos/${fileName}`;
      
      console.log('Nome do arquivo gerado:', fileName);
      console.log('Caminho do arquivo:', filePath);
      
      // Upload the file directly to the clinic-assets bucket
      console.log('=== FAZENDO UPLOAD PARA O BUCKET ===');
      const { data, error } = await supabase.storage
        .from('clinic-assets')
        .upload(filePath, logo, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Erro detalhado no upload:', error);
        throw error;
      }
      
      console.log('Upload realizado com sucesso:', data);
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('clinic-assets')
        .getPublicUrl(filePath);
      
      console.log('=== URL PÚBLICA GERADA ===');
      console.log('URL pública:', publicUrl);
      
      // Verify the file was uploaded correctly
      const { data: fileData, error: fileError } = await supabase.storage
        .from('clinic-assets')
        .list('clinic-logos', {
          limit: 100,
          offset: 0
        });
      
      console.log('Arquivos na pasta clinic-logos:', fileData);
      
      return publicUrl;
    } catch (error) {
      console.error('=== ERRO NO UPLOAD ===');
      console.error('Erro completo:', error);
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
      console.log('=== INICIANDO SUBMISSÃO DO FORMULÁRIO ===');
      console.log('Dados do formulário:', data);
      
      setIsUploading(true);
      
      // If there's a new logo, upload it first and wait for completion
      let logoUrl = data.logo_url;
      
      if (logo) {
        console.log('=== FAZENDO UPLOAD DO NOVO LOGO ===');
        const uploadedUrl = await uploadLogo();
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
          console.log('=== LOGO UPLOAD CONCLUÍDO ===');
          console.log('Nova URL do logo:', logoUrl);
        } else {
          // If upload failed, don't proceed
          toast({
            title: "Erro no upload",
            description: "Falha ao fazer upload da imagem. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
      }
      
      console.log('=== PREPARANDO DADOS PARA SALVAR ===');
      console.log('URL final do logo:', logoUrl);
      
      // Call onSave with the updated logo URL
      const clinicData: Clinic = {
        id: clinic?.id || '',
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
        active: data.active,
        logo_url: logoUrl
      };
      
      console.log('=== DADOS FINAIS DA CLÍNICA ===');
      console.log('Dados completos:', clinicData);
      
      onSave(clinicData);
      
    } catch (error) {
      console.error('=== ERRO NA SUBMISSÃO ===');
      console.error('Erro completo:', error);
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
                      onError={(e) => {
                        console.error('Erro ao carregar preview da imagem:', previewUrl);
                        e.currentTarget.style.display = 'none';
                      }}
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
                  {form.getValues('logo_url') && (
                    <p className="text-xs text-blue-600 mt-1">
                      URL atual: {form.getValues('logo_url')?.substring(0, 50)}...
                    </p>
                  )}
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
