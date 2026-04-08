import type { components } from '@/types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmationDialogAction from '@/components/shared/confirmationDialogAction';
import { ModelDetails } from './ModelDetails';
import { TASK_COLORS, TASK_LABELS } from './constants';
import { Copy, Trash2, Play, Square, Download, Eye } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

type Model = components['schemas']['Model'];

interface ModelTableProps {
  models: Model[];
  activeTab?: 'local' | 'audio' | 'remote';
  runningModels?: string[];
  loadMutation?: UseMutationResult<unknown, Error, string>;
  unloadMutation?: UseMutationResult<unknown, Error, string>;
  deleteMutation?: UseMutationResult<unknown, Error, string>;
  downloadMutation?: UseMutationResult<unknown, Error, string>;
  selectedModel?: Model | null;
  onSelectModel?: (model: Model | null) => void;
}

export function ModelTable({
  models,
  activeTab,
  runningModels = [],
  loadMutation,
  unloadMutation,
  deleteMutation,
  downloadMutation,
  selectedModel,
  onSelectModel,
}: ModelTableProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  const showActions = activeTab === 'local' || activeTab === 'remote';

  if (models.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Created</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.id}>
              <TableCell className="font-medium flex items-center justify-between">
                <span className="font-mono text-xs flex-shrink">{model.id}</span>
                <Button variant="ghost" size="icon" onClick={() => handleCopyId(model.id)}>
                  <Copy />
                </Button>
              </TableCell>
              <TableCell>
                <Badge className={TASK_COLORS[model.task]}>
                  {TASK_LABELS[model.task] || model.task}
                </Badge>
              </TableCell>
              <TableCell className="flex-shrink">
                {model.language?.length ? (
                  <div className="flex gap-1 flex-wrap">
                    {model.language.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{model.owned_by}</TableCell>
              <TableCell>{formatDate(model.created)}</TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {activeTab === 'local' && (
                      <>
                        <ModelDetails model={model}>
                          <Button variant="ghost" size="icon">
                            <Eye />
                          </Button>
                        </ModelDetails>
                        {runningModels.includes(model.id) ? (
                          <ConfirmationDialogAction
                            title="Unload Model"
                            description={`Do you want to unload "${model.id}" from memory?`}
                            confirmText="Unload"
                            disableConfirm={unloadMutation?.isPending}
                            onConfirm={() => unloadMutation?.mutate(model.id)}
                          >
                            <Button variant="ghost" size="icon">
                              <Square className="h-4 w-4" />
                            </Button>
                          </ConfirmationDialogAction>
                        ) : (
                          <ConfirmationDialogAction
                            title="Load Model"
                            description={`Do you want to load "${model.id}" into memory?`}
                            confirmText="Load"
                            disableConfirm={loadMutation?.isPending}
                            onConfirm={() => loadMutation?.mutate(model.id)}
                          >
                            <Button variant="ghost" size="icon">
                              <Play className="h-4 w-4" />
                            </Button>
                          </ConfirmationDialogAction>
                        )}
                        <ConfirmationDialogAction
                          title="Are you sure?"
                          description={`This will permanently delete the model "${model.id}" and cannot be undone.`}
                          confirmText="Delete"
                          confirmVariant="destructive"
                          disableConfirm={deleteMutation?.isPending}
                          onConfirm={() => deleteMutation?.mutate(model.id)}
                        >
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </ConfirmationDialogAction>
                      </>
                    )}
                    {activeTab === 'remote' && (
                      <ConfirmationDialogAction
                        title="Download Model"
                        description={`Do you want to download "${model.id}" from the remote registry?`}
                        confirmText="Download"
                        disableConfirm={downloadMutation?.isPending}
                        onConfirm={() => downloadMutation?.mutate(model.id)}
                      >
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </ConfirmationDialogAction>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
