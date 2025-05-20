
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface Doctor {
  id: string;
  name: string;
  crm: string;
}

interface SurgicalTeam {
  surgeon: Doctor | null;
  assistant: Doctor | null;
  anesthesiologist: Doctor | null;
}

interface SurgicalTeamSelectorProps {
  surgicalTeam: SurgicalTeam;
  setSurgicalTeam: React.Dispatch<React.SetStateAction<SurgicalTeam>>;
}

export const SurgicalTeamSelector: React.FC<SurgicalTeamSelectorProps> = ({ 
  surgicalTeam,
  setSurgicalTeam
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        // Fetch doctors from profiles with role 'doctor'
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, crm')
          .eq('role', 'doctor');

        if (error) throw error;

        if (data) {
          const formattedDoctors = data.map(doc => ({
            id: doc.id,
            name: `${doc.first_name} ${doc.last_name}`,
            crm: doc.crm
          }));
          setDoctors(formattedDoctors);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = searchTerm 
    ? doctors.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.crm.includes(searchTerm)
      )
    : doctors;

  const handleDoctorSelect = (role: keyof SurgicalTeam, doctorId: string) => {
    const selectedDoctor = doctors.find(doc => doc.id === doctorId) || null;
    setSurgicalTeam(prev => ({
      ...prev,
      [role]: selectedDoctor
    }));
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filtrar médicos por nome ou CRM"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="surgeon" className="text-sm font-medium">Cirurgião</label>
          <Select 
            value={surgicalTeam.surgeon?.id || ""} 
            onValueChange={(value) => handleDoctorSelect('surgeon', value)}
          >
            <SelectTrigger id="surgeon">
              <SelectValue placeholder="Selecione o cirurgião" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Carregando médicos...
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Nenhum médico encontrado
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.crm}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="assistant" className="text-sm font-medium">Auxiliar</label>
          <Select 
            value={surgicalTeam.assistant?.id || ""} 
            onValueChange={(value) => handleDoctorSelect('assistant', value)}
          >
            <SelectTrigger id="assistant">
              <SelectValue placeholder="Selecione o auxiliar" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Carregando médicos...
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Nenhum médico encontrado
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.crm}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="anesthesiologist" className="text-sm font-medium">Anestesista</label>
          <Select 
            value={surgicalTeam.anesthesiologist?.id || ""} 
            onValueChange={(value) => handleDoctorSelect('anesthesiologist', value)}
          >
            <SelectTrigger id="anesthesiologist">
              <SelectValue placeholder="Selecione o anestesista" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Carregando médicos...
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Nenhum médico encontrado
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.crm}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
