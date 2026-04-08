import type { components } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import React from 'react';

type Model = components['schemas']['Model'];

const TASK_COLORS: Record<string, string> = {
  'automatic-speech-recognition': 'bg-blue-500',
  'text-to-speech': 'bg-green-500',
  'speaker-embedding': 'bg-purple-500',
  'voice-activity-detection': 'bg-orange-500',
};

const TASK_LABELS: Record<string, string> = {
  'automatic-speech-recognition': 'ASR',
  'text-to-speech': 'TTS',
  'speaker-embedding': 'Embedding',
  'voice-activity-detection': 'VAD',
};

interface ModelDetailsProps {
  model: Model;
  children: React.ReactNode
}

export function ModelDetails({ model, children }: ModelDetailsProps) {
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: 'Copied to clipboard',
      description: 'Model ID has been copied.',
    });
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const renderDetailRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-start justify-between py-3 border-b last:border-0">
      <span className="text-sm font-medium text-muted-foreground min-w-[120px]">{label}</span>
      <div className="flex-1 ml-4">{value}</div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger>
        {children}
      </DialogTrigger>
      <DialogContent>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">Model Details</h3>
              <p className="text-sm text-muted-foreground">
                View detailed information about this model
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {renderDetailRow(
              'ID',
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{model.id}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopyId(model.id)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {renderDetailRow(
              'Task',
              <Badge className={TASK_COLORS[model.task] || 'bg-gray-500'}>
                {TASK_LABELS[model.task] || model.task}
              </Badge>
            )}

            {model.language &&
              model.language.length > 0 &&
              renderDetailRow(
                'Languages',
                <div className="flex flex-wrap gap-1">
                  {model.language.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              )}

            {renderDetailRow('Owner', <span>{model.owned_by}</span>)}

            {renderDetailRow('Created', <span>{formatTimestamp(model.created)}</span>)}

            {model.object && renderDetailRow('Object Type', <span>{String(model.object)}</span>)}

            {(model as any).root && renderDetailRow('Root', <span>{String((model as any).root)}</span>)}

            {(model as any).parent &&
              renderDetailRow('Parent', <span>{String((model as any).parent)}</span>)}

            {(model as any).permission &&
              renderDetailRow(
                'Permission',
                <Badge variant="outline">{String((model as any).permission)}</Badge>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
