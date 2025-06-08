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

  const handleSaveClinic = async (clinicData: any) => {
    if (!user) {
      console.error('Usuário não autenticado');
      return;
    }
    
    try {
      console.log('=== INICIANDO SALVAMENTO DA CLÍNICA ===');
      console.log('Dados recebidos do formulário:', clinicData);
      
      if (currentClinic) {
        // EDITANDO CLÍNICA EXISTENTE
        console.log('=== EDITANDO CLÍNICA EXISTENTE ===');
        console.log('ID da clínica:', currentClinic.id);
        
        // MONTAR OBJETO PARA UPDATE (seguindo o fluxo definido)
        const updateObject = {
          name: clinicData.name,
          address: clinicData.address,
          city: clinicData.city,
          phone: clinicData.phone,
          email: clinicData.email,
          active: clinicData.active,
          logo_url: clinicData.logo_url || currentClinic.logo_url || null,
          updated_at: new Date().toISOString()
        };
        
        console.log('Objeto para update:', updateObject);
        
        // EXECUTAR UPDATE NO SUPABASE
        const { error, data } = await supabase
          .from('clinics')
          .update(updateObject)
          .eq('id', currentClinic.id)
          .select();
        
        if (error) {
          console.error('Erro no update:', error);
          throw error;
        }
        
        console.log('✅ Update executado com sucesso:', data);
        
        toast({
          title: "Clínica atualizada",
          description: "As informações da clínica foram atualizadas com sucesso."
        });
        
      } else {
        // CRIANDO NOVA CLÍNICA
        console.log('=== CRIANDO NOVA CLÍNICA ===');
        
        const insertObject = {
          name: clinicData.name,
          address: clinicData.address,
          city: clinicData.city,
          phone: clinicData.phone,
          email: clinicData.email,
          active: clinicData.active,
          logo_url: clinicData.logo_url || null,
          created_by: user.id
        };
        
        console.log('Objeto para inserção:', insertObject);
        
        const { error, data } = await supabase
          .from('clinics')
          .insert(insertObject)
          .select();
        
        if (error) {
          console.error('Erro na inserção:', error);
          throw error;
        }
        
        console.log('✅ Inserção executada com sucesso:', data);
        
        toast({
          title: "Clínica adicionada",
          description: "A nova clínica foi adicionada com sucesso."
        });
      }
      
      // APÓS SUCESSO - ATUALIZAR LISTA E FECHAR MODAL
      console.log('=== FINALIZANDO PROCESSO ===');
      await refetchClinics();
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('=== ERRO NO PROCESSO ===');
      console.error('Erro completo:', error);
      
      toast({
        title: "Erro",
        description: "Não foi possível salvar a clínica. Tente novamente.",
        variant: "destructive"
      });
    }
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
