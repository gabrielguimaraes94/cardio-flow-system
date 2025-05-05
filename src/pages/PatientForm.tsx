
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export const PatientForm: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold mb-1">Novo Paciente</h2>
            <p className="text-gray-500">Preencha os dados do paciente</p>
          </div>
        </div>

        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="insurance">Convênios</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4 pt-4">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Data de Nascimento</Label>
                    <Input id="birthdate" type="date" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" placeholder="000.000.000-00" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input id="rg" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg font-medium">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="00000-000" />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">Endereço</Label>
                    <Input id="street" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sp">São Paulo</SelectItem>
                        <SelectItem value="rj">Rio de Janeiro</SelectItem>
                        <SelectItem value="mg">Minas Gerais</SelectItem>
                        {/* Outros estados */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button className="bg-cardio-500 hover:bg-cardio-600">
                <Save className="h-4 w-4 mr-2" />
                Salvar Paciente
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="insurance">
            <Card className="mt-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Convênios do Paciente</h3>
                <p className="text-gray-500">Selecione a aba "Dados Pessoais" e salve o paciente antes de adicionar convênios.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card className="mt-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Documentos do Paciente</h3>
                <p className="text-gray-500">Selecione a aba "Dados Pessoais" e salve o paciente antes de adicionar documentos.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="mt-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Histórico do Paciente</h3>
                <p className="text-gray-500">Selecione a aba "Dados Pessoais" e salve o paciente para visualizar o histórico.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
