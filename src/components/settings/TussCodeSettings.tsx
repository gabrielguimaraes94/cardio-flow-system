
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { z } from "zod";

// Schema para validação dos códigos TUSS
const tussCodeSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type TussCode = {
  id: string;
  code: string;
  description: string;
  justifications: string[];
};

export const TussCodeSettings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newJustifications, setNewJustifications] = useState('');
  const [tussCodes, setTussCodes] = useState<TussCode[]>([
    {
      id: '1',
      code: '30912016',
      description: 'Angioplastia transluminal percutânea',
      justifications: ['Estenose crítica', 'Obstrução parcial', 'Reserva fracionada de fluxo alterada'],
    },
    {
      id: '2',
      code: '30912083',
      description: 'Implante de stent coronário',
      justifications: ['Estenose crítica', 'Oclusão total', 'Dissecção coronária'],
    }
  ]);

  const filteredCodes = tussCodes.filter(code => 
    code.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    code.code.includes(searchTerm)
  );

  const handleAddCode = () => {
    try {
      // Validação com Zod
      const validatedData = tussCodeSchema.parse({
        code: newCode,
        description: newDescription,
      });
      
      const justificationsArray = newJustifications
        .split('\n')
        .map(j => j.trim())
        .filter(j => j !== '');

      const newTussCode: TussCode = {
        id: `${Date.now()}`, // Simples geração de ID para exemplo
        code: validatedData.code,
        description: validatedData.description,
        justifications: justificationsArray,
      };

      setTussCodes([...tussCodes, newTussCode]);
      setIsDialogOpen(false);
      resetForm();
      toast.success('Código TUSS adicionado com sucesso');
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error('Erro ao adicionar código TUSS');
      }
    }
  };

  const handleDeleteCode = (id: string) => {
    setTussCodes(tussCodes.filter(code => code.id !== id));
    toast.success('Código TUSS removido com sucesso');
  };

  const resetForm = () => {
    setNewCode('');
    setNewDescription('');
    setNewJustifications('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle>Configuração de Códigos TUSS</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-cardio-500 hover:bg-cardio-600">
            <Plus className="h-4 w-4 mr-2" />
            Novo Código
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="search" 
                placeholder="Buscar códigos TUSS..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[10%] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.length > 0 ? (
                  filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-medium">{code.code}</TableCell>
                      <TableCell>{code.description}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteCode(code.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                      Nenhum código TUSS encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Código TUSS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tuss-code">Código TUSS</Label>
                <Input 
                  id="tuss-code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ex: 30912016"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tuss-description">Descrição</Label>
                <Input
                  id="tuss-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ex: Angioplastia transluminal percutânea"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuss-justifications">
                Justificativas (uma por linha)
              </Label>
              <Textarea
                id="tuss-justifications"
                value={newJustifications}
                onChange={(e) => setNewJustifications(e.target.value)}
                placeholder="Ex: Estenose crítica&#10;Obstrução parcial&#10;Reserva fracionada de fluxo alterada"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-cardio-500 hover:bg-cardio-600" 
              onClick={handleAddCode}
            >
              Adicionar Código
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
