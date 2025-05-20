
import React, { useEffect, useState, useRef } from 'react';
import { TussCodeList } from './TussCodeList';
import { MaterialsList } from './MaterialsList';
import { PDFViewer } from './PDFViewer';
import { PDFActions } from './PDFActions';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { angioplastyService } from '@/services/angioplastyService';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const ImprovedRequestGenerator = () => {
  // PDF content ref
  const pdfContentRef = useRef<HTMLDivElement>(null);
  
  const { selectedClinic } = useClinic();
  const { toast } = useToast();
  
  // States for patient
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  
  // States for insurance
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [loadingInsurance, setLoadingInsurance] = useState(false);
  
  // States for doctors
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  
  // Surgical team states
  const [surgicalTeam, setSurgicalTeam] = useState({
    surgeon: null,
    assistant: null,
    anesthesiologist: null
  });
  
  // TUSS codes and materials states
  const [tussProcedures, setTussProcedures] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  // Treatment and angiography states
  const [coronaryAngiography, setCoronaryAngiography] = useState('');
  const [proposedTreatment, setProposedTreatment] = useState('');
  
  // Request number
  const [requestNumber, setRequestNumber] = useState('');
  
  // PDF generation state
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Generate request number on component mount
  useEffect(() => {
    setRequestNumber(angioplastyService.generateRequestNumber());
  }, []);
  
  // Load patients when clinic changes
  useEffect(() => {
    if (selectedClinic) {
      fetchPatients();
      fetchInsuranceCompanies();
      fetchDoctors();
    }
  }, [selectedClinic]);
  
  const fetchPatients = async () => {
    if (!selectedClinic) return;
    
    setLoadingPatients(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, birthdate')
        .eq('clinic_id', selectedClinic.id)
        .order('name');
        
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de pacientes",
        variant: "destructive"
      });
    } finally {
      setLoadingPatients(false);
    }
  };
  
  const fetchInsuranceCompanies = async () => {
    if (!selectedClinic) return;
    
    setLoadingInsurance(true);
    try {
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('id, company_name, trading_name')
        .eq('clinic_id', selectedClinic.id)
        .eq('active', true)
        .order('company_name');
        
      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        id: item.id,
        name: item.trading_name || item.company_name
      })) || [];
      
      setInsuranceCompanies(formattedData);
    } catch (error) {
      console.error('Error fetching insurance companies:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de convênios",
        variant: "destructive"
      });
    } finally {
      setLoadingInsurance(false);
    }
  };
  
  const fetchDoctors = async () => {
    if (!selectedClinic) return;
    
    setLoadingDoctors(true);
    try {
      // Fetch profiles of users that are part of the clinic staff with role "doctor"
      const { data: staffData, error: staffError } = await supabase
        .from('clinic_staff')
        .select(`
          user_id,
          profiles:user_id (
            id,
            first_name,
            last_name,
            crm
          )
        `)
        .eq('clinic_id', selectedClinic.id)
        .eq('active', true)
        .eq('role', 'doctor');
        
      if (staffError) throw staffError;
      
      const doctorsList = staffData
        ?.filter(item => item.profiles) // Ensure profile exists
        .map(item => ({
          id: item.profiles.id,
          name: `${item.profiles.first_name} ${item.profiles.last_name}`,
          crm: item.profiles.crm
        })) || [];
      
      setDoctors(doctorsList);
      
      // Set first doctor as default surgeon if available
      if (doctorsList.length > 0 && !surgicalTeam.surgeon) {
        setSurgicalTeam(prev => ({
          ...prev,
          surgeon: doctorsList[0]
        }));
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de médicos",
        variant: "destructive"
      });
    } finally {
      setLoadingDoctors(false);
    }
  };
  
  const handleSelectDoctor = (role, doctorId) => {
    if (!doctorId) {
      setSurgicalTeam(prev => ({
        ...prev,
        [role]: null
      }));
      return;
    }
    
    const selectedDoctor = doctors.find(d => d.id === doctorId);
    if (selectedDoctor) {
      setSurgicalTeam(prev => ({
        ...prev,
        [role]: selectedDoctor
      }));
    }
  };
  
  const handleResetForm = () => {
    // Reset all form fields except clinic data
    setSelectedPatient(null);
    setSelectedInsurance(null);
    setSurgicalTeam({
      surgeon: doctors.length > 0 ? doctors[0] : null,
      assistant: null,
      anesthesiologist: null
    });
    setTussProcedures([]);
    setMaterials([]);
    setCoronaryAngiography('');
    setProposedTreatment('');
    setRequestNumber(angioplastyService.generateRequestNumber());
    setShowPreview(false);
  };
  
  const handleGeneratePreview = () => {
    if (!selectedPatient) {
      toast({
        title: "Erro",
        description: "Selecione um paciente para gerar a solicitação",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedInsurance) {
      toast({
        title: "Erro",
        description: "Selecione um convênio para gerar a solicitação",
        variant: "destructive"
      });
      return;
    }
    
    if (!surgicalTeam.surgeon) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos o cirurgião responsável",
        variant: "destructive"
      });
      return;
    }
    
    if (tussProcedures.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um código TUSS",
        variant: "destructive"
      });
      return;
    }
    
    if (!coronaryAngiography.trim()) {
      toast({
        title: "Erro",
        description: "O campo de Coronariografia é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    if (!proposedTreatment.trim()) {
      toast({
        title: "Erro",
        description: "O campo de Tratamento Proposto é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    setShowPreview(true);
  };
  
  // Function to add TUSS procedure to list
  const handleAddTussProcedure = (procedure) => {
    setTussProcedures(prev => {
      if (prev.some(item => item.id === procedure.id)) {
        return prev;
      }
      return [...prev, procedure];
    });
  };
  
  // Function to remove TUSS procedure from list
  const handleRemoveTussProcedure = (procedureId) => {
    setTussProcedures(prev => prev.filter(item => item.id !== procedureId));
  };
  
  // Function to add material to list
  const handleAddMaterial = (material) => {
    setMaterials(prev => {
      if (prev.some(item => item.id === material.id)) {
        return prev.map(item => 
          item.id === material.id ? { ...item, quantity: item.quantity + material.quantity } : item
        );
      }
      return [...prev, material];
    });
  };
  
  // Function to remove material from list
  const handleRemoveMaterial = (materialId) => {
    setMaterials(prev => prev.filter(item => item.id !== materialId));
  };
  
  // Function to update material quantity
  const handleUpdateMaterialQuantity = (materialId, quantity) => {
    setMaterials(prev => 
      prev.map(item => item.id === materialId ? { ...item, quantity } : item)
    );
  };

  return (
    <div>
      <Tabs defaultValue="form">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="form" className="flex-1">Formulário</TabsTrigger>
          {showPreview && (
            <TabsTrigger value="preview" className="flex-1">Visualização</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Dados do Paciente</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Paciente</label>
                      <Select 
                        disabled={loadingPatients} 
                        value={selectedPatient?.id || ''} 
                        onValueChange={(value) => {
                          const patient = patients.find(p => p.id === value);
                          setSelectedPatient(patient || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingPatients ? "Carregando..." : "Selecione um paciente"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Pacientes</SelectLabel>
                            {patients.map(patient => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Convênio</label>
                      <Select 
                        disabled={loadingInsurance} 
                        value={selectedInsurance?.id || ''} 
                        onValueChange={(value) => {
                          const insurance = insuranceCompanies.find(i => i.id === value);
                          setSelectedInsurance(insurance || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingInsurance ? "Carregando..." : "Selecione um convênio"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Convênios</SelectLabel>
                            {insuranceCompanies.map(insurance => (
                              <SelectItem key={insurance.id} value={insurance.id}>
                                {insurance.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4 mt-6">Equipe Cirúrgica</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cirurgião</label>
                      <Select 
                        disabled={loadingDoctors} 
                        value={surgicalTeam.surgeon?.id || ''} 
                        onValueChange={(value) => handleSelectDoctor('surgeon', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingDoctors ? "Carregando..." : "Selecione o cirurgião"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Médicos</SelectLabel>
                            {doctors.map(doctor => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.crm}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Auxiliar</label>
                      <Select 
                        disabled={loadingDoctors} 
                        value={surgicalTeam.assistant?.id || ''} 
                        onValueChange={(value) => handleSelectDoctor('assistant', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o auxiliar (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Médicos</SelectLabel>
                            <SelectItem value="">Nenhum</SelectItem>
                            {doctors.map(doctor => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.crm}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Anestesista</label>
                      <Select 
                        disabled={loadingDoctors} 
                        value={surgicalTeam.anesthesiologist?.id || ''} 
                        onValueChange={(value) => handleSelectDoctor('anesthesiologist', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o anestesista (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Médicos</SelectLabel>
                            <SelectItem value="">Nenhum</SelectItem>
                            {doctors.map(doctor => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.crm}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4 mt-6">Informações Clínicas</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Coronariografia</label>
                      <Textarea 
                        placeholder="Descreva os achados da coronariografia"
                        value={coronaryAngiography}
                        onChange={(e) => setCoronaryAngiography(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Tratamento Proposto</label>
                      <Textarea 
                        placeholder="Descreva o tratamento proposto"
                        value={proposedTreatment}
                        onChange={(e) => setProposedTreatment(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Accordion type="multiple" defaultValue={["codes", "materials"]}>
                <AccordionItem value="codes">
                  <AccordionTrigger>Códigos TUSS ({tussProcedures.length})</AccordionTrigger>
                  <AccordionContent>
                    <TussCodeList 
                      selectedProcedures={tussProcedures}
                      onAdd={handleAddTussProcedure}
                      onRemove={handleRemoveTussProcedure}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="materials">
                  <AccordionTrigger>Materiais ({materials.length})</AccordionTrigger>
                  <AccordionContent>
                    <MaterialsList 
                      selectedMaterials={materials}
                      onAdd={handleAddMaterial}
                      onRemove={handleRemoveMaterial}
                      onUpdateQuantity={handleUpdateMaterialQuantity}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleResetForm}>
                  Limpar Formulário
                </Button>
                <Button onClick={handleGeneratePreview}>
                  Gerar Solicitação
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {showPreview && (
          <TabsContent value="preview" className="relative">
            {/* Add PDF Actions */}
            <PDFActions
              data={{
                patient: selectedPatient,
                insurance: selectedInsurance,
                clinic: selectedClinic,
                tussProcedures,
                materials,
                surgicalTeam,
                coronaryAngiography,
                proposedTreatment,
                requestNumber
              }}
              contentRef={pdfContentRef}
            />
            
            <div className="mt-4 border rounded-md p-4 bg-white shadow-sm">
              <PDFViewer 
                patient={selectedPatient}
                insurance={selectedInsurance}
                clinic={selectedClinic}
                tussProcedures={tussProcedures}
                materials={materials}
                surgicalTeam={surgicalTeam}
                coronaryAngiography={coronaryAngiography}
                proposedTreatment={proposedTreatment}
                requestNumber={requestNumber}
                contentRef={pdfContentRef}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
