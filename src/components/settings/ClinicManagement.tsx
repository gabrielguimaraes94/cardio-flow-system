
import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, MapPin, Phone, Mail, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClinicDialog } from './ClinicDialog';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  active: boolean;
  logo_url?: string;
}

export const ClinicManagement = () => {
  const { selectedClinic, refetchClinics, clinics: contextClinics } = useClinic();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [displayedClinics, setDisplayedClinics] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use clinics from context instead of fetching again
  useEffect(() => {
    if (contextClinics) {
      setDisplayedClinics(contextClinics);
    }
  }, [contextClinics]);

  // Filtrar clínicas com base no termo de pesquisa
  useEffect(() => {
    if (searchTerm === '') {
      setDisplayedClinics(contextClinics);
      return;
    }
    
    const filtered = contextClinics.filter(clinic => 
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      clinic.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setDisplayedClinics(filtered);
  }, [searchTerm, contextClinics]);

  const handleAddClinic = () => {
    setCurrentClinic(null);
    setIsDialogOpen(true);
  };

  const handleEditClinic = (clinic: any) => {
    setCurrentClinic(clinic);
    setIsDialogOpen(true);
  };

  const handleSaveClinic = async (clinic: any) => {
    if (!user) return;
    
    try {
      console.log('=== INICIANDO SALVAMENTO DA CLÍNICA ===');
      console.log('Dados da clínica recebidos:', clinic);
      console.log('Logo URL recebida:', clinic.logo_url);
      
      if (currentClinic) {
        // Editar clínica existente
        console.log('=== EDITANDO CLÍNICA EXISTENTE ===');
        console.log('ID da clínica:', clinic.id);
        
        const updateData = {
          name: clinic.name,
          address: clinic.address,
          city: clinic.city,
          phone: clinic.phone,
          email: clinic.email,
          active: clinic.active,
          logo_url: clinic.logo_url || null,
          updated_at: new Date().toISOString()
        };
        
        console.log('Dados para atualização:', updateData);
        
        // Usar uma query mais específica para garantir que os dados sejam retornados
        const { error, data } = await supabase
          .from('clinics')
          .update(updateData)
          .eq('id', clinic.id)
          .select('*')
          .single();
        
        if (error) {
          console.error('Erro ao atualizar clínica:', error);
          throw error;
        }
        
        console.log('Clínica atualizada com sucesso:', data);
        
        // Verificar se realmente atualizou
        if (data) {
          console.log('✅ Dados retornados do Supabase após update:', data);
          
          // Fazer uma verificação adicional buscando diretamente
          const { data: verificationData, error: verificationError } = await supabase
            .from('clinics')
            .select('*')
            .eq('id', clinic.id)
            .single();
            
          if (verificationError) {
            console.error('Erro na verificação:', verificationError);
          } else {
            console.log('✅ Verificação - dados atuais na base:', verificationData);
          }
        } else {
          console.warn('⚠️ Nenhum dado retornado do update');
        }
        
        toast({
          title: "Clínica atualizada",
          description: "As informações da clínica foram atualizadas com sucesso."
        });
      } else {
        // Adicionar nova clínica
        console.log('=== ADICIONANDO NOVA CLÍNICA ===');
        
        const insertData = {
          name: clinic.name,
          address: clinic.address,
          city: clinic.city,
          phone: clinic.phone,
          email: clinic.email,
          active: clinic.active,
          logo_url: clinic.logo_url || null,
          created_by: user.id
        };
        
        console.log('Dados para inserção:', insertData);
        
        const { error, data } = await supabase
          .from('clinics')
          .insert(insertData)
          .select('*')
          .single();
        
        if (error) {
          console.error('Erro ao criar clínica:', error);
          throw error;
        }
        
        console.log('Clínica criada com sucesso:', data);
        
        toast({
          title: "Clínica adicionada",
          description: "A nova clínica foi adicionada com sucesso."
        });
      }
      
      // Forçar atualização da lista de clínicas no contexto
      console.log('=== ATUALIZANDO LISTA DE CLÍNICAS ===');
      await refetchClinics();
      console.log('=== LISTA DE CLÍNICAS ATUALIZADA ===');
      
    } catch (error) {
      console.error('Erro ao salvar clínica:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a clínica.",
        variant: "destructive"
      });
    }
    
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestão de Clínicas</CardTitle>
            <CardDescription>
              {selectedClinic 
                ? `Gerenciando a clínica: ${selectedClinic.name}` 
                : 'Gerencie as clínicas e consultórios cadastrados no sistema.'}
            </CardDescription>
          </div>
          <Button onClick={handleAddClinic}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Clínica
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clínicas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Carregando clínicas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedClinics.length > 0 ? (
              displayedClinics.map((clinic) => (
                <Card key={clinic.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {clinic.logo_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img 
                              src={clinic.logo_url} 
                              alt={`Logo ${clinic.name}`}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                console.error('Erro ao carregar imagem:', clinic.logo_url);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-xl">{clinic.name}</CardTitle>
                          <CardDescription className="mt-1">{clinic.city}</CardDescription>
                        </div>
                      </div>
                      {clinic.active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativo</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{clinic.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{clinic.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{clinic.email}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-gray-50 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClinic(clinic)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center p-8 border rounded-md bg-gray-50">
                <div className="text-center">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma clínica encontrada</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <ClinicDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSave={handleSaveClinic} 
        clinic={currentClinic} 
      />
    </Card>
  );
};
