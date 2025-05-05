
import React, { useState } from 'react';
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
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';

export const AnamnesisForm: React.FC = () => {
  // Estado para medicações
  const [medications, setMedications] = useState<{ name: string; dose: string; posology: string }[]>([]);
  const [newMedication, setNewMedication] = useState({ name: '', dose: '', posology: '' });

  // Função para adicionar nova medicação
  const addMedication = () => {
    if (newMedication.name.trim() !== '') {
      setMedications([...medications, { ...newMedication }]);
      setNewMedication({ name: '', dose: '', posology: '' });
    }
  };

  // Função para remover medicação
  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold mb-1">Anamnese</h2>
            <p className="text-gray-500">João Silva, 65 anos</p>
          </div>
        </div>

        {/* FATORES DE RISCO CARDIOVASCULAR */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xl font-medium">Fatores de Risco Cardiovascular</h3>
            <Separator />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="hypertension" />
                    <Label htmlFor="hypertension" className="font-medium">Hipertensão Arterial</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="hypertension-time">Há quanto tempo?</Label>
                      <div className="flex gap-2 items-center">
                        <Input id="hypertension-time" type="number" className="w-20" />
                        <span>anos</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hypertension-meds">Medicações</Label>
                      <Input id="hypertension-meds" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="diabetes" />
                    <Label htmlFor="diabetes" className="font-medium">Diabetes</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="diabetes-type">Tipo</Label>
                      <Select>
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
                      <Select>
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
                      <Input id="diabetes-meds" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="dyslipidemia" />
                    <Label htmlFor="dyslipidemia" className="font-medium">Dislipidemia</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="dyslipidemia-values">Valores</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="cholesterol" className="text-xs">Colesterol Total</Label>
                          <Input id="cholesterol" />
                        </div>
                        <div>
                          <Label htmlFor="ldl" className="text-xs">LDL</Label>
                          <Input id="ldl" />
                        </div>
                        <div>
                          <Label htmlFor="hdl" className="text-xs">HDL</Label>
                          <Input id="hdl" />
                        </div>
                        <div>
                          <Label htmlFor="triglycerides" className="text-xs">Triglicérides</Label>
                          <Input id="triglycerides" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dyslipidemia-meds">Medicações</Label>
                      <Input id="dyslipidemia-meds" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="smoking" className="font-medium">Tabagismo</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Select>
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
                      <Input id="smoking-years" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="family-history" />
                    <Label htmlFor="family-history" className="font-medium">Histórico Familiar</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="family-history-details">Parentes de 1º grau com DAC</Label>
                      <Input id="family-history-details" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="obesity" />
                    <Label htmlFor="obesity" className="font-medium">Obesidade</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="bmi">IMC atual</Label>
                      <Input id="bmi" type="number" step="0.01" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sedentary" />
                    <Label htmlFor="sedentary" className="font-medium">Sedentarismo</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="physical-activity">Nível de atividade física</Label>
                      <Select>
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
                    <Checkbox id="previous-iam" />
                    <Label htmlFor="previous-iam" className="font-medium">IAM Prévio</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="iam-date">Data</Label>
                        <Input id="iam-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iam-location">Localização</Label>
                        <Input id="iam-location" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iam-treatment">Tratamento</Label>
                      <Input id="iam-treatment" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="previous-angioplasty" />
                    <Label htmlFor="previous-angioplasty" className="font-medium">Angioplastia Prévia</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="angioplasty-date">Data</Label>
                        <Input id="angioplasty-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="angioplasty-vessels">Vasos Tratados</Label>
                        <Input id="angioplasty-vessels" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="angioplasty-stents">Stents</Label>
                      <Input id="angioplasty-stents" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="revascularization" />
                    <Label htmlFor="revascularization" className="font-medium">Revascularização Miocárdica</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="revascularization-date">Data</Label>
                        <Input id="revascularization-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="revascularization-grafts">Enxertos</Label>
                        <Input id="revascularization-grafts" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="valvopathy" />
                    <Label htmlFor="valvopathy" className="font-medium">Valvopatias</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="valvopathy-type">Tipo</Label>
                      <Select>
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
                      <Select>
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
                    <Checkbox id="heart-failure" />
                    <Label htmlFor="heart-failure" className="font-medium">Insuficiência Cardíaca</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="heart-failure-class">Classe Funcional (NYHA)</Label>
                      <Select>
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
                    <Checkbox id="renal-disease" />
                    <Label htmlFor="renal-disease" className="font-medium">Doença Renal Crônica</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="renal-stage">Estágio</Label>
                      <Select>
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
                      <Checkbox id="dialysis" />
                      <Label htmlFor="dialysis">Diálise</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="respiratory-disease" />
                    <Label htmlFor="respiratory-disease" className="font-medium">DPOC/Asma</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="respiratory-type">Tipo</Label>
                      <Select>
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
                      <Select>
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
                    <Checkbox id="stroke" />
                    <Label htmlFor="stroke" className="font-medium">AVC/AIT Prévio</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="stroke-type">Tipo</Label>
                      <Select>
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
                      <Input id="stroke-date" type="date" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stroke-sequelae">Sequelas</Label>
                      <Input id="stroke-sequelae" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pad" />
                    <Label htmlFor="pad" className="font-medium">Doença Arterial Periférica</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="pad-severity">Gravidade</Label>
                      <Select>
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
                      <Input id="pad-treatment" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="other-comorbidities" />
                  <Label htmlFor="other-comorbidities" className="font-medium">Outras Doenças Relevantes</Label>
                </div>
                
                <div className="pl-6 space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="other-comorbidities-details">Detalhes</Label>
                    <Textarea id="other-comorbidities-details" rows={3} />
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
                    <Checkbox id="chest-pain" />
                    <Label htmlFor="chest-pain" className="font-medium">Dor Torácica</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="chest-pain-characteristics">Características</Label>
                      <Select>
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
                      <Input id="chest-pain-duration" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="chest-pain-radiation">Irradiação</Label>
                      <Input id="chest-pain-radiation" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="dyspnea" />
                    <Label htmlFor="dyspnea" className="font-medium">Dispneia</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="dyspnea-class">Classe Funcional</Label>
                      <Select>
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
                    <Checkbox id="syncope" />
                    <Label htmlFor="syncope" className="font-medium">Síncope/Pré-síncope</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="syncope-frequency">Frequência</Label>
                      <Input id="syncope-frequency" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="palpitations" />
                    <Label htmlFor="palpitations" className="font-medium">Palpitações</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="palpitations-characteristics">Características</Label>
                      <Input id="palpitations-characteristics" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="edema" />
                    <Label htmlFor="edema" className="font-medium">Edema de Membros</Label>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="edema-location">Localização</Label>
                      <Input id="edema-location" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edema-intensity">Intensidade</Label>
                      <Select>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medication-name">Nome</Label>
                  <Input 
                    id="medication-name" 
                    placeholder="Nome da medicação" 
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication-dose">Dosagem</Label>
                  <Input 
                    id="medication-dose" 
                    placeholder="Ex: 50mg" 
                    value={newMedication.dose}
                    onChange={(e) => setNewMedication({...newMedication, dose: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication-posology">Posologia</Label>
                  <Input 
                    id="medication-posology" 
                    placeholder="Ex: 1 comprimido de 8/8h" 
                    value={newMedication.posology}
                    onChange={(e) => setNewMedication({...newMedication, posology: e.target.value})}
                  />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={addMedication}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Medicação
              </Button>
              
              <div className="mt-4">
                {medications.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nome</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Dosagem</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Posologia</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {medications.map((med, index) => (
                          <tr key={index} className="bg-white">
                            <td className="px-4 py-3 text-sm">{med.name}</td>
                            <td className="px-4 py-3 text-sm">{med.dose}</td>
                            <td className="px-4 py-3 text-sm">{med.posology}</td>
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
                        <Checkbox id="antiplatelets" />
                        <Label htmlFor="antiplatelets">Antiagregantes</Label>
                      </div>
                      <div className="pl-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="aas" />
                          <Label htmlFor="aas">AAS</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="clopidogrel" />
                          <Label htmlFor="clopidogrel">Clopidogrel</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="ticagrelor" />
                          <Label htmlFor="ticagrelor">Ticagrelor</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="prasugrel" />
                          <Label htmlFor="prasugrel">Prasugrel</Label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="anticoagulants" />
                        <Label htmlFor="anticoagulants">Anticoagulantes</Label>
                      </div>
                      <div className="pl-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="warfarin" />
                          <Label htmlFor="warfarin">Varfarina</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="dabigatran" />
                          <Label htmlFor="dabigatran">Dabigatrana</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="rivaroxaban" />
                          <Label htmlFor="rivaroxaban">Rivaroxabana</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="apixaban" />
                          <Label htmlFor="apixaban">Apixabana</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="edoxaban" />
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

        <div className="flex justify-end gap-2">
          <Button variant="outline">
            Cancelar
          </Button>
          <Button className="bg-primary hover:bg-secondary">
            <Save className="h-4 w-4 mr-2" />
            Salvar Anamnese
          </Button>
        </div>
      </div>
    </Layout>
  );
};
