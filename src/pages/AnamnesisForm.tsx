
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';

export const AnamnesisForm: React.FC = () => {
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xl font-medium">Medicações em Uso</h3>
            <Separator />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medication-name">Nome</Label>
                  <Input id="medication-name" placeholder="Nome da medicação" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication-dose">Dosagem</Label>
                  <Input id="medication-dose" placeholder="Ex: 50mg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication-posology">Posologia</Label>
                  <Input id="medication-posology" placeholder="Ex: 1 comprimido de 8/8h" />
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                + Adicionar Medicação
              </Button>
              
              <div className="mt-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500 italic">Nenhuma medicação adicionada</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">
            Cancelar
          </Button>
          <Button className="bg-cardio-500 hover:bg-cardio-600">
            <Save className="h-4 w-4 mr-2" />
            Salvar Anamnese
          </Button>
        </div>
      </div>
    </Layout>
  );
};
