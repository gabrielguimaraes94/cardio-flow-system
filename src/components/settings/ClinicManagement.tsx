
import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash, MapPin, Phone, Mail, Building } from 'lucide-react';
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
}

export const ClinicManagement = () => {
  const { selectedClinic, refetchClinics } = useClinic();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [displayedClinics, setDisplayedClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar clínicas
  const fetchClinics = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('created_by', user.id);
      
      if (error) throw error;
      
      if (data) {
        setClinics(data);
        setDisplayedClinics(data);
      }
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as clínicas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [user]);

  // Filtrar clínicas com base no termo de pesquisa
  useEffect(() => {
    if (searchTerm === '') {
      setDisplayedClinics(clinics);
      return;
    }
    
    const filtered = clinics.filter(clinic => 
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      clinic.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setDisplayedClinics(filtered);
  }, [searchTerm, clinics]);

  const handleAddClinic = () => {
    setCurrentClinic(null);
    setIsDialogOpen(true);
  };

  const handleEditClinic = (clinic: Clinic) => {
    setCurrentClinic(clinic);
    setIsDialogOpen(true);
  };

  const handleSaveClinic = async (clinic: Clinic) => {
    if (!user) return;
    
    try {
      if (currentClinic) {
        // Editar clínica existente
        const { error } = await supabase
          .from('clinics')
          .update({
            name: clinic.name,
            address: clinic.address,
            city: clinic.city,
            phone: clinic.phone,
            email: clinic.email,
            active: clinic.active,
            updated_at: new Date().toISOString()
          })
          .eq('id', clinic.id);
        
        if (error) throw error;
        
        toast({
          title: "Clínica atualizada",
          description: "As informações da clínica foram atualizadas com sucesso."
        });
      } else {
        // Adicionar nova clínica
        const { error } = await supabase
          .from('clinics')
          .insert({
            name: clinic.name,
            address: clinic.address,
            city: clinic.city,
            phone: clinic.phone,
            email: clinic.email,
            active: clinic.active,
            created_by: user.id
          });
        
        if (error) throw error;
        
        toast({
          title: "Clínica adicionada",
          description: "A nova clínica foi adicionada com sucesso."
        });
      }
      
      // Atualizar a lista de clínicas
      await fetchClinics();
      // Atualizar a lista de clínicas no contexto
      await refetchClinics();
      
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

  const handleDeleteClinic = async (clinicId: string) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .delete()
        .eq('id', clinicId);
      
      if (error) throw error;
      
      toast({
        title: "Clínica excluída",
        description: "A clínica foi excluída com sucesso."
      });
      
      // Atualizar a lista de clínicas
      await fetchClinics();
      // Atualizar a lista de clínicas no contexto
      await refetchClinics();
      
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a clínica.",
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
                      <div>
                        <CardTitle className="text-xl">{clinic.name}</CardTitle>
                        <CardDescription className="mt-1">{clinic.city}</CardDescription>
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
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClinic(clinic.id)}>
                      <Trash className="h-4 w-4 mr-1" />
                      Excluir
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
