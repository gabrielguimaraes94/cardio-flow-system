
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TemplateNode } from '@/pages/CatheterizationTemplateEditor';
import { Grip, Plus, Trash2, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface ArterialTreeProps {
  structure: TemplateNode[];
  onChange: (structure: TemplateNode[]) => void;
}

// Simple utility function to move an item in an array
const moveItem = (array: any[], from: number, to: number) => {
  const newArray = [...array];
  const [movedItem] = newArray.splice(from, 1);
  newArray.splice(to, 0, movedItem);
  return newArray;
};

const NodeItem = ({ 
  node, 
  onUpdate, 
  onDelete, 
  onAddChild, 
  onMoveUp, 
  onMoveDown,
  isDragging = false
}: { 
  node: TemplateNode, 
  onUpdate: (updated: TemplateNode) => void,
  onDelete: () => void,
  onAddChild: () => void,
  onMoveUp: () => void,
  onMoveDown: () => void,
  isDragging?: boolean
}) => {
  return (
    <div 
      className={`border rounded-md p-3 mb-3 bg-white ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="cursor-move mr-2">
            <Grip className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            value={node.name} 
            onChange={e => onUpdate({ ...node, name: e.target.value })}
            className="font-medium" 
            placeholder="Nome da artéria/parâmetro"
          />
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onMoveUp}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onMoveDown}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Select 
            value={node.type}
            onValueChange={(value) => onUpdate({ 
              ...node, 
              type: value as 'text' | 'select' | 'number' | 'radio'
            })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="select">Seleção</SelectItem>
              <SelectItem value="number">Numérico</SelectItem>
              <SelectItem value="radio">Sim/Não</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={onAddChild}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {(node.type === 'select' || node.type === 'radio') && (
        <div className="mb-3">
          <p className="text-sm font-medium mb-2">Opções:</p>
          <div className="flex flex-wrap gap-2">
            {node.options?.map((option, index) => (
              <div key={index} className="flex items-center">
                <Input 
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(node.options || [])];
                    newOptions[index] = e.target.value;
                    onUpdate({ ...node, options: newOptions });
                  }}
                  className="text-sm"
                  size={10}
                />
                <Button variant="ghost" size="icon" onClick={() => {
                  const newOptions = [...(node.options || [])];
                  newOptions.splice(index, 1);
                  onUpdate({ ...node, options: newOptions });
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onUpdate({ 
                ...node, 
                options: [...(node.options || []), 'Nova Opção']
              })}
            >
              <Plus className="h-3 w-3 mr-1" /> Adicionar
            </Button>
          </div>
        </div>
      )}
      
      {node.type === 'number' && (
        <div className="mb-3">
          <p className="text-sm font-medium mb-2">Valor padrão:</p>
          <Input 
            type="number" 
            value={node.defaultValue as number || 0} 
            onChange={(e) => onUpdate({ 
              ...node, 
              defaultValue: parseInt(e.target.value)
            })}
            className="w-32"
          />
        </div>
      )}
      
      {node.children && node.children.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Parâmetros filhos:</p>
          <NestedArterialTree 
            structure={node.children}
            onChange={(newChildren) => {
              onUpdate({ ...node, children: newChildren });
            }}
          />
        </div>
      )}
    </div>
  );
};

const NestedArterialTree = ({ structure, onChange }: ArterialTreeProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = structure.findIndex(item => item.id === active.id);
    const newIndex = structure.findIndex(item => item.id === over.id);
    
    onChange(moveItem(structure, oldIndex, newIndex));
  };

  const handleUpdate = (index: number, updatedNode: TemplateNode) => {
    const newStructure = [...structure];
    newStructure[index] = updatedNode;
    onChange(newStructure);
  };
  
  const handleDelete = (index: number) => {
    const newStructure = [...structure];
    newStructure.splice(index, 1);
    onChange(newStructure);
  };
  
  const handleAddChild = (index: number) => {
    const newStructure = [...structure];
    if (!newStructure[index].children) {
      newStructure[index].children = [];
    }
    newStructure[index].children?.push({
      id: `${Date.now()}`,
      name: 'Novo Parâmetro',
      type: 'text'
    });
    onChange(newStructure);
  };
  
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newStructure = [...structure];
    [newStructure[index - 1], newStructure[index]] = [newStructure[index], newStructure[index - 1]];
    onChange(newStructure);
  };
  
  const handleMoveDown = (index: number) => {
    if (index === structure.length - 1) return;
    const newStructure = [...structure];
    [newStructure[index], newStructure[index + 1]] = [newStructure[index + 1], newStructure[index]];
    onChange(newStructure);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {structure.map((node, index) => (
        <NodeItem 
          key={node.id}
          node={node}
          onUpdate={(updated) => handleUpdate(index, updated)}
          onDelete={() => handleDelete(index)}
          onAddChild={() => handleAddChild(index)}
          onMoveUp={() => handleMoveUp(index)}
          onMoveDown={() => handleMoveDown(index)}
          isDragging={activeId === node.id}
        />
      ))}
    </DndContext>
  );
};

export const ArterialTree = ({ structure, onChange }: ArterialTreeProps) => {
  const handleAddNode = () => {
    const newNode: TemplateNode = {
      id: `${Date.now()}`,
      name: 'Nova Artéria',
      type: 'select',
      options: ['Pequeno', 'Moderado', 'Importante']
    };
    onChange([...structure, newNode]);
  };

  return (
    <div>
      <div className="mb-4">
        <Button onClick={handleAddNode}>
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
        <NestedArterialTree 
          structure={structure}
          onChange={onChange}
        />
      )}
    </div>
  );
};
