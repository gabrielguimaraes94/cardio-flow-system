
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateNode } from '@/pages/CatheterizationTemplateEditor';
import { Separator } from '@/components/ui/separator';

interface SimplifiedArterialTreeProps {
  structure: TemplateNode[];
  onChange: (structure: TemplateNode[]) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const ArterySection: React.FC<{
  artery: TemplateNode;
  onChange: (updated: TemplateNode) => void;
  onDelete: () => void;
  index: number;
}> = ({ artery, onChange, onDelete, index }) => {
  const [expanded, setExpanded] = useState(true);
  const [hasLesions, setHasLesions] = useState(
    artery.children?.some(child => child.name === 'Lesões') || false
  );

  // Find the size option (Importante, moderado, pequeno)
  const sizeOption = artery.options || ['Importante', 'Moderado', 'Pequeno'];
  
  // Handle adding a new lesion
  const handleAddLesion = () => {
    const lesionsNode = artery.children?.find(child => child.name === 'Lesões') || {
      id: generateId(),
      name: 'Lesões',
      type: 'radio',
      options: ['Com lesões', 'Sem lesões'],
      children: []
    };
    
    const newLesion = {
      id: generateId(),
      name: `Lesão ${(lesionsNode.children?.length || 0) + 1}`,
      type: 'select',
      children: [
        {
          id: generateId(),
          name: 'Tipo',
          type: 'select',
          options: ['Grave', 'Moderada', 'Discreta']
        },
        {
          id: generateId(),
          name: 'Característica',
          type: 'select',
          options: ['Calcificada', 'Focal', 'Difusa']
        },
        {
          id: generateId(),
          name: 'Localização',
          type: 'select',
          options: ['Proximal', 'Médio', 'Distal', 'Bifurcação']
        },
        {
          id: generateId(),
          name: 'Percentual de estenose',
          type: 'number',
          defaultValue: 0
        }
      ]
    };
    
    let updatedArtery;
    
    // If there's no Lesões node yet, create it
    if (!lesionsNode.id.includes(generateId().split('-')[0])) {
      if (!artery.children) {
        artery.children = [];
      }
      
      lesionsNode.children = [newLesion];
      artery.children.push(lesionsNode);
      updatedArtery = {...artery};
    } else {
      // If there's already a Lesões node, add a new lesion to it
      const updatedChildren = artery.children?.map(child => {
        if (child.name === 'Lesões') {
          return {
            ...child,
            children: [...(child.children || []), newLesion]
          };
        }
        return child;
      });
      
      updatedArtery = {
        ...artery,
        children: updatedChildren
      };
    }
    
    onChange(updatedArtery);
    setHasLesions(true);
  };
  
  // Handle updating a lesion
  const handleUpdateLesion = (lesionIndex: number, field: string, value: string | number) => {
    const updatedChildren = artery.children?.map(child => {
      if (child.name === 'Lesões') {
        const updatedLesions = (child.children || []).map((lesion, idx) => {
          if (idx === lesionIndex) {
            const updatedLesionChildren = (lesion.children || []).map(prop => {
              if (prop.name === field) {
                return { ...prop, defaultValue: value };
              }
              return prop;
            });
            return { ...lesion, children: updatedLesionChildren };
          }
          return lesion;
        });
        return { ...child, children: updatedLesions };
      }
      return child;
    });
    
    onChange({
      ...artery,
      children: updatedChildren
    });
  };
  
  // Handle removing a lesion
  const handleRemoveLesion = (lesionIndex: number) => {
    const updatedChildren = artery.children?.map(child => {
      if (child.name === 'Lesões') {
        const filteredLesions = (child.children || []).filter((_, idx) => idx !== lesionIndex);
        return { ...child, children: filteredLesions };
      }
      return child;
    });
    
    onChange({
      ...artery,
      children: updatedChildren
    });
  };
  
  // Get lesions from the artery
  const lesions = artery.children?.find(child => child.name === 'Lesões')?.children || [];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
            <Input 
              value={artery.name} 
              onChange={e => onChange({ ...artery, name: e.target.value })}
              className="max-w-[300px] font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor={`artery-size-${index}`}>Tamanho:</Label>
              <Select 
                value={(artery.defaultValue as string) || sizeOption[0]} 
                onValueChange={(value) => onChange({ ...artery, defaultValue: value })}
              >
                <SelectTrigger id={`artery-size-${index}`} className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizeOption.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDelete}
              className="ml-2"
            >
              Remover
            </Button>
          </div>
        </div>
        
        {expanded && (
          <div className="pl-10 space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`has-lesions-${index}`} 
                checked={hasLesions}
                onCheckedChange={(checked) => {
                  setHasLesions(!!checked);
                  // If checked, add a lesion, otherwise remove all lesions
                  if (checked && !lesions.length) {
                    handleAddLesion();
                  } else if (!checked) {
                    const updatedChildren = artery.children?.filter(child => child.name !== 'Lesões');
                    onChange({
                      ...artery,
                      children: updatedChildren
                    });
                  }
                }}
              />
              <Label htmlFor={`has-lesions-${index}`}>Exibe lesão</Label>
            </div>
            
            {hasLesions && (
              <div className="space-y-6 mt-4">
                {lesions.map((lesion, lesionIdx) => {
                  // Get properties of the lesion
                  const typeNode = lesion.children?.find(c => c.name === 'Tipo');
                  const characteristicNode = lesion.children?.find(c => c.name === 'Característica');
                  const locationNode = lesion.children?.find(c => c.name === 'Localização');
                  const percentNode = lesion.children?.find(c => c.name === 'Percentual de estenose');
                  
                  return (
                    <div key={lesion.id} className="border p-4 rounded-md">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">{lesion.name}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveLesion(lesionIdx)}
                        >
                          Remover
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select 
                            value={(typeNode?.defaultValue as string) || ''} 
                            onValueChange={(value) => handleUpdateLesion(lesionIdx, 'Tipo', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {typeNode?.options?.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Característica</Label>
                          <Select 
                            value={(characteristicNode?.defaultValue as string) || ''} 
                            onValueChange={(value) => handleUpdateLesion(lesionIdx, 'Característica', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {characteristicNode?.options?.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Localização</Label>
                          <Select 
                            value={(locationNode?.defaultValue as string) || ''} 
                            onValueChange={(value) => handleUpdateLesion(lesionIdx, 'Localização', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {locationNode?.options?.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>% Estenose</Label>
                          <Input 
                            type="number" 
                            value={(percentNode?.defaultValue as number) || 0} 
                            onChange={(e) => handleUpdateLesion(lesionIdx, 'Percentual de estenose', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <Button onClick={handleAddLesion} variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar nova lesão
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const SimplifiedArterialTree: React.FC<SimplifiedArterialTreeProps> = ({ 
  structure, 
  onChange 
}) => {
  const handleAddArtery = () => {
    const newArtery: TemplateNode = {
      id: generateId(),
      name: 'Nova Artéria',
      type: 'select',
      options: ['Importante', 'Moderado', 'Pequeno'],
      defaultValue: 'Importante'
    };
    onChange([...structure, newArtery]);
  };

  const handleUpdateArtery = (index: number, updated: TemplateNode) => {
    const newStructure = [...structure];
    newStructure[index] = updated;
    onChange(newStructure);
  };

  const handleRemoveArtery = (index: number) => {
    const newStructure = [...structure];
    newStructure.splice(index, 1);
    onChange(newStructure);
  };

  // Generate sentence preview based on structure
  const generateSentencePreview = () => {
    if (!structure.length) return "";
    
    return structure.map(artery => {
      const arteryName = artery.name;
      const arterySize = artery.defaultValue || artery.options?.[0] || "";
      
      const lesionsNode = artery.children?.find(child => child.name === 'Lesões');
      if (!lesionsNode || !lesionsNode.children?.length) {
        return `${arteryName} ${arterySize}, sem lesões obstrutivas.`;
      }
      
      // Get first lesion for preview (can be expanded to include all)
      const lesion = lesionsNode.children[0];
      const typeNode = lesion.children?.find(c => c.name === 'Tipo');
      const characteristicNode = lesion.children?.find(c => c.name === 'Característica');
      const locationNode = lesion.children?.find(c => c.name === 'Localização');
      const percentNode = lesion.children?.find(c => c.name === 'Percentual de estenose');
      
      const type = typeNode?.defaultValue || "";
      const characteristic = characteristicNode?.defaultValue || "";
      const location = locationNode?.defaultValue || "";
      const percent = percentNode?.defaultValue || "0";
      
      return `${arteryName} ${arterySize}, exibe lesão ${characteristic} ${type} de ${percent}% no terço ${location}.`;
    }).join(" ");
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Button onClick={handleAddArtery}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Artéria
        </Button>
      </div>
      
      {structure.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">
            Adicione artérias ao seu template para começar.
          </p>
        </div>
      ) : (
        <div>
          {structure.map((artery, index) => (
            <ArterySection
              key={artery.id}
              artery={artery}
              onChange={(updated) => handleUpdateArtery(index, updated)}
              onDelete={() => handleRemoveArtery(index)}
              index={index}
            />
          ))}
          
          <Card className="mt-8">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Prévia do Texto:</h3>
              <Separator className="my-4" />
              <p className="whitespace-pre-line text-gray-700">
                {generateSentencePreview()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
