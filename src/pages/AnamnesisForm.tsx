import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePatient } from '@/contexts/PatientContext';
import { PatientSelectorDropdown } from '@/components/patients/PatientSelectorDropdown';
import { patientService } from '@/services/patientService';
import { anamnesisService, type AnamnesisData } from '@/services/anamnesisService';
import { supabase } from '@/integrations/supabase/client';

export const AnamnesisForm: React.FC = () => {
  const navigate = useNavigate();
  const { id, anamnesisId } = useParams<{ id: string; anamnesisId: string }>();
  const { toast } = useToast();
  const { selectedPatient, setSelectedPatient, clearSelectedPatient, resetPatientSelection } = usePatient();
  
  // Estado para verificar se a anamnese já está salva (somente leitura)
  const [isSaved, setIsSaved] = useState(Boolean(anamnesisId));
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para medicações
  const [medications, setMedications] = useState<{ name: string; dose: string; posology: string }[]>([]);
  const [newMedication, setNewMedication] = useState({ name: '', dose: '', posology: '' });

  // Estado para todos os campos do formulário
  const [formData, setFormData] = useState({
    // Fatores de risco
    hypertension: false,
    hypertensionTime: '',
    hypertensionMeds: '',
    diabetes: false,
    diabetesType: '',
    diabetesControl: '',
    diabetesMeds: '',
    dyslipidemia: false,
    cholesterol: '',
    ldl: '',
    hdl: '',
    triglycerides: '',
    dyslipidemiaeMeds: '',
    smoking: '',
    smokingYears: '',
    familyHistory: false,
    familyHistoryDetails: '',
    obesity: false,
    bmi: '',
    sedentary: false,
    physicalActivity: '',
  });

  // Carrega dados do paciente quando ID é fornecido via URL
  useEffect(() => {
    const fetchPatientData = async () => {
      if (id && !selectedPatient) {
        try {
          const { patient } = await patientService.getPatientById(id);
          if (patient) {
            setSelectedPatient({
              ...patient,
              age: patient.birthdate ? new Date().getFullYear() - new Date(patient.birthdate).getFullYear() : undefined
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do paciente:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do paciente.",
            variant: "destructive"
          });
        }
      }
    };

    fetchPatientData();
  }, [id, selectedPatient, setSelectedPatient, toast]);

  // Carrega dados da anamnese existente quando temos um anamnesisId
  useEffect(() => {
    const fetchAnamnesisData = async () => {
      if (anamnesisId && id) {
        try {
          setIsLoading(true);
          const { anamnesis } = await anamnesisService.getAnamnesisById(anamnesisId);
          
          // Preencher o formulário com os dados da anamnese
          setFormData({
            hypertension: anamnesis.hypertension || false,
            hypertensionTime: anamnesis.hypertension_time || '',
            hypertensionMeds: anamnesis.hypertension_meds || '',
            diabetes: anamnesis.diabetes || false,
            diabetesType: anamnesis.diabetes_type || '',
            diabetesControl: anamnesis.diabetes_control || '',
            diabetesMeds: anamnesis.diabetes_meds || '',
            dyslipidemia: anamnesis.dyslipidemia || false,
            cholesterol: anamnesis.cholesterol || '',
            ldl: anamnesis.ldl || '',
            hdl: anamnesis.hdl || '',
            triglycerides: anamnesis.triglycerides || '',
            dyslipidemiaeMeds: anamnesis.dyslipidemia_meds || '',
            smoking: anamnesis.smoking || '',
            smokingYears: anamnesis.smoking_years || '',
            familyHistory: anamnesis.family_history || false,
            familyHistoryDetails: anamnesis.family_history_details || '',
            obesity: anamnesis.obesity || false,
            bmi: anamnesis.bmi || '',
            sedentary: anamnesis.sedentary || false,
            physicalActivity: anamnesis.physical_activity || '',
          });
          
          // Preencher medicações
          if (anamnesis.medications) {
            setMedications(anamnesis.medications as { name: string; dose: string; posology: string }[]);
          }
          
          setIsSaved(true);
        } catch (error) {
          console.error('Erro ao carregar anamnese:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados da anamnese.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAnamnesisData();
  }, [anamnesisId, id, toast]);

  // Limpa o paciente selecionado quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Cleanup será executado quando sair da página
    };
  }, []);

  const resetForm = () => {
    setFormData({
      hypertension: false,
      hypertensionTime: '',
      hypertensionMeds: '',
      diabetes: false,
      diabetesType: '',
      diabetesControl: '',
      diabetesMeds: '',
      dyslipidemia: false,
      cholesterol: '',
      ldl: '',
      hdl: '',
      triglycerides: '',
      dyslipidemiaeMeds: '',
      smoking: '',
      smokingYears: '',
      familyHistory: false,
      familyHistoryDetails: '',
      obesity: false,
      bmi: '',
      sedentary: false,
      physicalActivity: '',
    });
    setMedications([]);
    setNewMedication({ name: '', dose: '', posology: '' });
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    resetForm(); // Reset form when selecting a patient
  };

  const handleChangePatient = () => {
    resetForm(); // Reset form when changing patient
    resetPatientSelection();
  };

  // Função para adicionar nova medicação
  const addMedication = () => {
    if (newMedication.name.trim() !== '' && !isSaved) {
      setMedications([...medications, { ...newMedication }]);
      setNewMedication({ name: '', dose: '', posology: '' });
    }
  };

  // Função para remover medicação
  const removeMedication = (index: number) => {
    if (!isSaved) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };
  
  // Função para voltar à página anterior
  const handleGoBack = () => {
    clearSelectedPatient(); // Limpa o paciente selecionado ao voltar
    navigate(-1);
  };
  
  // Função para salvar anamnese
  const handleSaveAnamnesis = async () => {
    if (!selectedPatient) {
      toast({
        title: "Erro",
        description: "Selecione um paciente antes de salvar a anamnese.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Obter dados do perfil do usuário para o nome do médico
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, crm')
        .eq('id', user.id)
        .single();

      const doctorName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : '';

      // Preparar dados da anamnese
      const anamnesisData: Omit<AnamnesisData, 'id'> = {
        patient_id: selectedPatient.id,
        created_by: user.id,
        
        // Fatores de risco cardiovascular
        hypertension: formData.hypertension,
        hypertension_time: formData.hypertensionTime,
        hypertension_meds: formData.hypertensionMeds,
        diabetes: formData.diabetes,
        diabetes_type: formData.diabetesType,
        diabetes_control: formData.diabetesControl,
        diabetes_meds: formData.diabetesMeds,
        dyslipidemia: formData.dyslipidemia,
        cholesterol: formData.cholesterol,
        ldl: formData.ldl,
        hdl: formData.hdl,
        triglycerides: formData.triglycerides,
        dyslipidemia_meds: formData.dyslipidemiaeMeds,
        smoking: formData.smoking,
        smoking_years: formData.smokingYears,
        family_history: formData.familyHistory,
        family_history_details: formData.familyHistoryDetails,
        obesity: formData.obesity,
        bmi: formData.bmi,
        sedentary: formData.sedentary,
        physical_activity: formData.physicalActivity,
        
        // Medicações
        medications: medications,
        
        // Informações do médico
        doctor_name: doctorName,
        doctor_crm: profile?.crm || '',
      };

      // Salvar no banco de dados
      await anamnesisService.createAnamnesis(anamnesisData);
      
      toast({
        title: "Sucesso",
        description: "A anamnese foi salva com sucesso no banco de dados.",
      });
      
      setIsSaved(true);
      
      // Navegar para o histórico do paciente
      navigate(`/patients/${selectedPatient.id}/history`);
      
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar anamnese. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">Anamnese</h2>
            <p className="text-gray-500">
              {selectedPatient ? `${selectedPatient.name}, ${selectedPatient.age} anos` : 'Selecione um paciente para iniciar'}
            </p>
          </div>
          {selectedPatient && !isSaved && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetForm}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar Formulário
            </Button>
          )}
        </div>

        {/* Seletor de Paciente */}
        <PatientSelectorDropdown
          selectedPatient={selectedPatient}
          onPatientSelect={handlePatientSelect}
          onChangePatient={handleChangePatient}
        />

        {/* Aviso de modo somente leitura */}
        {isSaved && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Esta anamnese já foi salva e está em modo somente leitura. Não é possível fazer alterações.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FATORES DE RISCO CARDIOVASCULAR */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xl font-medium">Fatores de Risco Cardiovascular</h3>
            <Separator />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hypertension" 
                      checked={formData.hypertension}
                      onCheckedChange={(checked) => setFormData({...formData, hypertension: !!checked})}
                      disabled={isSaved}
                    />
                    <Label htmlFor="hypertension" className="font-medium">Hipertensão Arterial</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="hypertension-time">Há quanto tempo?</Label>
                      <div className="flex gap-2 items-center">
                        <Input 
                          id="hypertension-time" 
                          type="number" 
                          className="w-20" 
                          value={formData.hypertensionTime}
                          onChange={(e) => setFormData({...formData, hypertensionTime: e.target.value})}
                          disabled={isSaved}
                        />
                        <span>anos</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hypertension-meds">Medicações</Label>
                      <Input 
                        id="hypertension-meds" 
                        value={formData.hypertensionMeds}
                        onChange={(e) => setFormData({...formData, hypertensionMeds: e.target.value})}
                        disabled={isSaved}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="diabetes" 
                      checked={formData.diabetes}
                      onCheckedChange={(checked) => setFormData({...formData, diabetes: !!checked})}
                      disabled={isSaved}
                    />
                    <Label htmlFor="diabetes" className="font-medium">Diabetes</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="diabetes-type">Tipo</Label>
                      <Select 
                        value={formData.diabetesType} 
                        onValueChange={(value) => setFormData({...formData, diabetesType: value})}
                        disabled={isSaved}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="type1">Tipo 1</SelectItem>
                          <SelectItem value="type2">Tipo 2</SelectItem>
                          <SelectItem value="gestational">Gestacional</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="diabetes-control">Controle</Label>
                      <Select 
                        value={formData.diabetesControl} 
                        onValueChange={(value) => setFormData({...formData, diabetesControl: value})}
                        disabled={isSaved}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">Bom</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="bad">Ruim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="diabetes-meds">Medicações</Label>
                      <Input 
                        id="diabetes-meds" 
                        value={formData.diabetesMeds}
                        onChange={(e) => setFormData({...formData, diabetesMeds: e.target.value})}
                        disabled={isSaved}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="dyslipidemia" disabled={isSaved} />
                    <Label htmlFor="dyslipidemia" className="font-medium">Dislipidemia</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="dyslipidemia-values">Valores</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="cholesterol" className="text-xs">Colesterol Total</Label>
                          <Input id="cholesterol" disabled={isSaved} />
                        </div>
                        <div>
                          <Label htmlFor="ldl" className="text-xs">LDL</Label>
                          <Input id="ldl" disabled={isSaved} />
                        </div>
                        <div>
                          <Label htmlFor="hdl" className="text-xs">HDL</Label>
                          <Input id="hdl" disabled={isSaved} />
                        </div>
                        <div>
                          <Label htmlFor="triglycerides" className="text-xs">Triglicérides</Label>
                          <Input id="triglycerides" disabled={isSaved} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dyslipidemia-meds">Medicações</Label>
                      <Input id="dyslipidemia-meds" disabled={isSaved} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="smoking" className="font-medium">Tabagismo</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Nunca</SelectItem>
                          <SelectItem value="current">Atual</SelectItem>
                          <SelectItem value="former">Ex-fumante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smoking-years">Anos/Maço</Label>
                      <Input id="smoking-years" disabled={isSaved} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="family-history" disabled={isSaved} />
                    <Label htmlFor="family-history" className="font-medium">Histórico Familiar</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="family-history-details">Parentes de 1º grau com DAC</Label>
                      <Input id="family-history-details" disabled={isSaved} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="obesity" disabled={isSaved} />
                    <Label htmlFor="obesity" className="font-medium">Obesidade</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="bmi">IMC atual</Label>
                      <Input id="bmi" type="number" step="0.01" disabled={isSaved} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sedentary" disabled={isSaved} />
                    <Label htmlFor="sedentary" className="font-medium">Sedentarismo</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="physical-activity">Nível de atividade física</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          <SelectItem value="light">Leve</SelectItem>
                          <SelectItem value="moderate">Moderada</SelectItem>
                          <SelectItem value="intense">Intensa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HISTÓRICO CARDIOVASCULAR */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xl font-medium">Histórico Cardiovascular</h3>
            <Separator />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="previous-iam" disabled={isSaved} />
                    <Label htmlFor="previous-iam" className="font-medium">IAM Prévio</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="iam-date">Data</Label>
                        <Input id="iam-date" type="date" disabled={isSaved} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iam-location">Localização</Label>
                        <Input id="iam-location" disabled={isSaved} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iam-treatment">Tratamento</Label>
                      <Input id="iam-treatment" disabled={isSaved} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="previous-angioplasty" disabled={isSaved} />
                    <Label htmlFor="previous-angioplasty" className="font-medium">Angioplastia Prévia</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="angioplasty-date">Data</Label>
                        <Input id="angioplasty-date" type="date" disabled={isSaved} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="angioplasty-vessels">Vasos Tratados</Label>
                        <Input id="angioplasty-vessels" disabled={isSaved} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="angioplasty-stents">Stents</Label>
                      <Input id="angioplasty-stents" disabled={isSaved} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="revascularization" disabled={isSaved} />
                    <Label htmlFor="revascularization" className="font-medium">Revascularização Miocárdica</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="revascularization-date">Data</Label>
                        <Input id="revascularization-date" type="date" disabled={isSaved} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="revascularization-grafts">Enxertos</Label>
                        <Input id="revascularization-grafts" disabled={isSaved} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="valvopathy" disabled={isSaved} />
                    <Label htmlFor="valvopathy" className="font-medium">Valvopatias</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="valvopathy-type">Tipo</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aortic-stenosis">Estenose Aórtica</SelectItem>
                          <SelectItem value="aortic-insufficiency">Insuficiência Aórtica</SelectItem>
                          <SelectItem value="mitral-stenosis">Estenose Mitral</SelectItem>
                          <SelectItem value="mitral-insufficiency">Insuficiência Mitral</SelectItem>
                          <SelectItem value="tricuspid">Tricúspide</SelectItem>
                          <SelectItem value="pulmonary">Pulmonar</SelectItem>
                          <SelectItem value="other">Outra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valvopathy-severity">Gravidade</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Leve</SelectItem>
                          <SelectItem value="moderate">Moderada</SelectItem>
                          <SelectItem value="severe">Grave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="heart-failure" disabled={isSaved} />
                    <Label htmlFor="heart-failure" className="font-medium">Insuficiência Cardíaca</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="heart-failure-class">Classe Funcional (NYHA)</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class-i">Classe I</SelectItem>
                          <SelectItem value="class-ii">Classe II</SelectItem>
                          <SelectItem value="class-iii">Classe III</SelectItem>
                          <SelectItem value="class-iv">Classe IV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* COMORBIDADES ADICIONAIS */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xl font-medium">Comorbidades Adicionais</h3>
            <Separator />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="renal-disease" disabled={isSaved} />
                    <Label htmlFor="renal-disease" className="font-medium">Doença Renal Crônica</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="renal-stage">Estágio</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stage-1">Estágio 1</SelectItem>
                          <SelectItem value="stage-2">Estágio 2</SelectItem>
                          <SelectItem value="stage-3a">Estágio 3A</SelectItem>
                          <SelectItem value="stage-3b">Estágio 3B</SelectItem>
                          <SelectItem value="stage-4">Estágio 4</SelectItem>
                          <SelectItem value="stage-5">Estágio 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox id="dialysis" disabled={isSaved} />
                      <Label htmlFor="dialysis">Diálise</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="respiratory-disease" disabled={isSaved} />
                    <Label htmlFor="respiratory-disease" className="font-medium">DPOC/Asma</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="respiratory-type">Tipo</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="copd">DPOC</SelectItem>
                          <SelectItem value="asthma">Asma</SelectItem>
                          <SelectItem value="both">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="respiratory-control">Controle</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">Bom</SelectItem>
                          <SelectItem value="moderate">Moderado</SelectItem>
                          <SelectItem value="bad">Ruim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="stroke" disabled={isSaved} />
                    <Label htmlFor="stroke" className="font-medium">AVC/AIT Prévio</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="stroke-type">Tipo</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ischemic">AVC Isquêmico</SelectItem>
                          <SelectItem value="hemorrhagic">AVC Hemorrágico</SelectItem>
                          <SelectItem value="tia">AIT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stroke-date">Data</Label>
                      <Input id="stroke-date" type="date" disabled={isSaved} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stroke-sequelae">Sequelas</Label>
                      <Input id="stroke-sequelae" disabled={isSaved} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pad" disabled={isSaved} />
                    <Label htmlFor="pad" className="font-medium">Doença Arterial Periférica</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="pad-severity">Gravidade</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Leve</SelectItem>
                          <SelectItem value="moderate">Moderada</SelectItem>
                          <SelectItem value="severe">Grave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pad-treatment">Tratamento</Label>
                      <Input id="pad-treatment" disabled={isSaved} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="other-comorbidities" disabled={isSaved} />
                  <Label htmlFor="other-comorbidities" className="font-medium">Outras Doenças Relevantes</Label>
                </div>
                
                <div className="pl-6 space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="other-comorbidities-details">Detalhes</Label>
                    <Textarea id="other-comorbidities-details" rows={3} disabled={isSaved} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SINTOMAS ATUAIS */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xl font-medium">Sintomas Atuais</h3>
            <Separator />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="chest-pain" disabled={isSaved} />
                    <Label htmlFor="chest-pain" className="font-medium">Dor Torácica</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="chest-pain-characteristics">Características</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="typical">Típica</SelectItem>
                          <SelectItem value="atypical">Atípica</SelectItem>
                          <SelectItem value="non-anginal">Não anginosa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="chest-pain-duration">Duração</Label>
                      <Input id="chest-pain-duration" disabled={isSaved} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="chest-pain-radiation">Irradiação</Label>
                      <Input id="chest-pain-radiation" disabled={isSaved} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="dyspnea" disabled={isSaved} />
                    <Label htmlFor="dyspnea" className="font-medium">Dispneia</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="dyspnea-class">Classe Funcional</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class-i">Classe I</SelectItem>
                          <SelectItem value="class-ii">Classe II</SelectItem>
                          <SelectItem value="class-iii">Classe III</SelectItem>
                          <SelectItem value="class-iv">Classe IV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="syncope" disabled={isSaved} />
                    <Label htmlFor="syncope" className="font-medium">Síncope/Pré-síncope</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="syncope-frequency">Frequência</Label>
                      <Input id="syncope-frequency" disabled={isSaved} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="palpitations" disabled={isSaved} />
                    <Label htmlFor="palpitations" className="font-medium">Palpitações</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="palpitations-characteristics">Características</Label>
                      <Input id="palpitations-characteristics" disabled={isSaved} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="edema" disabled={isSaved} />
                    <Label htmlFor="edema" className="font-medium">Edema de Membros</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="edema-location">Localização</Label>
                      <Input id="edema-location" disabled={isSaved} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edema-intensity">Intensidade</Label>
                      <Select disabled={isSaved}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Leve (+/4+)</SelectItem>
                          <SelectItem value="moderate">Moderado (++/4+)</SelectItem>
                          <SelectItem value="severe">Grave (+++/4+)</SelectItem>
                          <SelectItem value="very-severe">Muito Grave (++++/4+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MEDICAÇÕES EM USO */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xl font-medium">Medicações em Uso</h3>
            <Separator />
            
            <div className="space-y-4">
              {!isSaved && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medication-name">Nome</Label>
                      <Input 
                        id="medication-name" 
                        placeholder="Nome da medicação" 
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                        disabled={isSaved}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medication-dose">Dosagem</Label>
                      <Input 
                        id="medication-dose" 
                        placeholder="Ex: 50mg" 
                        value={newMedication.dose}
                        onChange={(e) => setNewMedication({...newMedication, dose: e.target.value})}
                        disabled={isSaved}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medication-posology">Posologia</Label>
                      <Input 
                        id="medication-posology" 
                        placeholder="Ex: 1 comprimido de 8/8h" 
                        value={newMedication.posology}
                        onChange={(e) => setNewMedication({...newMedication, posology: e.target.value})}
                        disabled={isSaved}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={addMedication}
                    disabled={isSaved}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Medicação
                  </Button>
                </>
              )}
              
              <div className="mt-4">
                {medications.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nome</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Dosagem</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Posologia</th>
                          {!isSaved && (
                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Ações</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {medications.map((med, index) => (
                          <tr key={index} className="bg-white">
                            <td className="px-4 py-3 text-sm">{med.name}</td>
                            <td className="px-4 py-3 text-sm">{med.dose}</td>
                            <td className="px-4 py-3 text-sm">{med.posology}</td>
                            {!isSaved && (
                              <td className="px-4 py-3 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => removeMedication(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 italic">Nenhuma medicação adicionada</p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="font-medium">Antiagregantes/Anticoagulantes</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="antiplatelets" disabled={isSaved} />
                        <Label htmlFor="antiplatelets">Antiagregantes</Label>
                      </div>
                      <div className="pl-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="aas" disabled={isSaved} />
                          <Label htmlFor="aas">AAS</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="clopidogrel" disabled={isSaved} />
                          <Label htmlFor="clopidogrel">Clopidogrel</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="ticagrelor" disabled={isSaved} />
                          <Label htmlFor="ticagrelor">Ticagrelor</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="prasugrel" disabled={isSaved} />
                          <Label htmlFor="prasugrel">Prasugrel</Label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="anticoagulants" disabled={isSaved} />
                        <Label htmlFor="anticoagulants">Anticoagulantes</Label>
                      </div>
                      <div className="pl-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="warfarin" disabled={isSaved} />
                          <Label htmlFor="warfarin">Varfarina</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="dabigatran" disabled={isSaved} />
                          <Label htmlFor="dabigatran">Dabigatrana</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="rivaroxaban" disabled={isSaved} />
                          <Label htmlFor="rivaroxaban">Rivaroxabana</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="apixaban" disabled={isSaved} />
                          <Label htmlFor="apixaban">Apixabana</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="edoxaban" disabled={isSaved} />
                          <Label htmlFor="edoxaban">Edoxabana</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isSaved && selectedPatient && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleGoBack}>
              Cancelar
            </Button>
            <Button 
              className="bg-primary hover:bg-secondary"
              onClick={handleSaveAnamnesis}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Anamnese'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};
