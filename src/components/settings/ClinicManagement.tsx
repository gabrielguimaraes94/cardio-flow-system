
import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash, MapPin, Phone, Mail, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClinicDialog } from './ClinicDialog';
import { Badge } from '@/components/ui/badge';

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
  const [clinics, setClinics] = useState<Clinic[]>([
    { id: '1', name: 'Cardio Center', address: 'Av. Paulista, 1000', city: 'São Paulo', phone: '(11) 3456-7890', email: 'contato@cardiocenter.com', active: true },
    { id: '2', name: 'Instituto Cardiovascular', address: 'Rua Barata Ribeiro, 500', city: 'Rio de Janeiro', phone: '(21) 3456-7890', email: 'contato@instituto.com', active: true },
    { id: '3', name: 'Clínica do Coração', address: 'Av. Afonso Pena, 1500', city: 'Belo Horizonte', phone: '(31) 3456-7890', email: 'contato@clinica.com', active: true },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);

  const filteredClinics = clinics.filter(clinic => 
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    clinic.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClinic = () => {
    setCurrentClinic(null);
    setIsDialogOpen(true);
  };

  const handleEditClinic = (clinic: Clinic) => {
    setCurrentClinic(clinic);
    setIsDialogOpen(true);
  };

  const handleSaveClinic = (clinic: Clinic) => {
    if (currentClinic) {
      // Edit existing clinic
      setClinics(clinics.map(c => c.id === clinic.id ? clinic : c));
    } else {
      // Add new clinic
      setClinics([...clinics, { ...clinic, id: Date.now().toString() }]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteClinic = (clinicId: string) => {
    setClinics(clinics.filter(clinic => clinic.id !== clinicId));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestão de Clínicas</CardTitle>
            <CardDescription>Gerencie as clínicas e consultórios cadastrados no sistema.</CardDescription>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClinics.map((clinic) => (
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
          ))}
          
          {filteredClinics.length === 0 && (
            <div className="col-span-full flex items-center justify-center p-8 border rounded-md bg-gray-50">
              <div className="text-center">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhuma clínica encontrada</p>
              </div>
            </div>
          )}
        </div>
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
