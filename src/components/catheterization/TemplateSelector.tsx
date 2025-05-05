
import React from 'react';
import { Template } from '@/pages/CatheterizationTemplateEditor';
import { Badge } from '@/components/ui/badge';
import { Share2, User } from 'lucide-react';

interface TemplateSelectorProps {
  templates: Template[];
  currentTemplateId: string;
  onSelect: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  currentTemplateId,
  onSelect
}) => {
  // Group templates by author
  const templatesByAuthor = templates.reduce((acc, template) => {
    if (!acc[template.author]) {
      acc[template.author] = [];
    }
    acc[template.author].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="space-y-4">
      {Object.entries(templatesByAuthor).map(([author, authorTemplates]) => (
        <div key={author} className="space-y-2">
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{author}</span>
          </div>
          
          <div className="space-y-1">
            {authorTemplates.map(template => (
              <div
                key={template.id}
                className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  template.id === currentTemplateId ? 'bg-muted' : ''
                }`}
                onClick={() => onSelect(template.id)}
              >
                <span className="text-sm truncate">{template.name}</span>
                {template.shared && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    <span className="text-xs">Compartilhado</span>
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
