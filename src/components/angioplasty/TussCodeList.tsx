
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TussCode {
  id: string;
  code: string;
  description: string;
  justifications: string[];
  referenceValue: number;
}

export const TussCodeList = () => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // This would come from a database in a real implementation
  const [tussCodes, setTussCodes] = useState<TussCode[]>([
    {
      id: '1',
      code: '30912016',
      description: 'Angioplastia transluminal percutânea',
      justifications: ['Estenose crítica', 'Obstrução parcial', 'Reserva fracionada de fluxo alterada'],
      referenceValue: 4500.00
    },
    {
      id: '2',
      code: '30912083',
      description: 'Implante de stent coronário',
      justifications: ['Estenose crítica', 'Oclusão total', 'Dissecção coronária'],
      referenceValue: 6800.00
    }
  ]);
  
  const [currentCode, setCurrentCode] = useState<TussCode>({
    id: '',
    code: '',
    description: '',
    justifications: [],
    referenceValue: 0
  });
  
  const handleSave = () => {
    if (!currentCode.code || !currentCode.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (isEditing) {
      setTussCodes(prev => 
        prev.map(item => item.id === isEditing ? currentCode : item)
      );
      toast.success('Código TUSS atualizado com sucesso');
    } else {
      setTussCodes(prev => [...prev, { ...currentCode, id: Date.now().toString() }]);
      toast.success('Código TUSS adicionado com sucesso');
    }
    
    handleCloseSheet();
  };
  
  const handleCloseSheet = () => {
    setIsAddingNew(false);
    setIsEditing(null);
    setCurrentCode({
      id: '',
      code: '',
      description: '',
      justifications: [],
      referenceValue: 0
    });
  };
  
  const handleEdit = (code: TussCode) => {
    setCurrentCode(code);
    setIsEditing(code.id);
    setIsAddingNew(true);
  };
  
  const handleDelete = (id: string) => {
    setTussCodes(prev => prev.filter(item => item.id !== id));
    toast.success('Código TUSS removido com sucesso');
  };

  const handleJustificationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const justifications = e.target.value
      .split('\n')
      .filter(j => j.trim() !== '');
    
    setCurrentCode(prev => ({...prev, justifications}));
  };
  
  const filteredCodes = tussCodes.filter(code => 
    code.code.includes(searchQuery) || 
    code.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Cadastro de Códigos TUSS</h2>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Buscar código ou descrição..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-[150px]">Valor Ref.</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCodes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Nenhum código TUSS encontrado
              </TableCell>
            </TableRow>
          ) : (
            filteredCodes.map((code) => (
              <TableRow key={code.id}>
                <TableCell className="font-medium">{code.code}</TableCell>
                <TableCell>{code.description}</TableCell>
                <TableCell>R$ {code.referenceValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(code)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(code.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Add/Edit Sheet */}
      <Sheet open={isAddingNew} onOpenChange={setIsAddingNew}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Editar' : 'Adicionar'} Código TUSS</SheetTitle>
            <SheetDescription>
              Preencha os detalhes do código TUSS para procedimentos de angioplastia.
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Código TUSS *
              </label>
              <Input
                id="code"
                value={currentCode.code}
                onChange={(e) => setCurrentCode(prev => ({...prev, code: e.target.value}))}
                placeholder="Ex: 30912016"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição do Procedimento *
              </label>
              <Input
                id="description"
                value={currentCode.description}
                onChange={(e) => setCurrentCode(prev => ({...prev, description: e.target.value}))}
                placeholder="Ex: Angioplastia transluminal percutânea"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="justifications" className="text-sm font-medium">
                Justificativas Padrão
              </label>
              <Textarea
                id="justifications"
                value={currentCode.justifications.join('\n')}
                onChange={handleJustificationsChange}
                placeholder="Digite cada justificativa em uma linha separada"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="referenceValue" className="text-sm font-medium">
                Valor de Referência (R$)
              </label>
              <Input
                id="referenceValue"
                type="number"
                step="0.01"
                value={currentCode.referenceValue}
                onChange={(e) => setCurrentCode(prev => ({...prev, referenceValue: parseFloat(e.target.value)}))}
                placeholder="Ex: 4500.00"
              />
            </div>
          </div>
          
          <SheetFooter>
            <Button variant="outline" onClick={handleCloseSheet}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
