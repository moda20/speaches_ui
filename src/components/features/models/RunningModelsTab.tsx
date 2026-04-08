import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import type { components } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmationDialogAction from '@/components/shared/confirmationDialogAction';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { toast } from '@/hooks/use-toast';
import { TASK_COLORS, TASK_LABELS } from './constants';
import { Square } from 'lucide-react';

type Model = components['schemas']['Model'];

interface RunningModelsTabProps {
  onRefresh: () => void;
}

export function RunningModelsTab({ onRefresh }: RunningModelsTabProps) {
  const queryClient = useQueryClient();

  const { data: localModels = [] } = useQuery({
    queryKey: ['models', 'local'],
    queryFn: () => modelsService.getLocalModels(),
  });

  const {
    data: runningModels = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['models', 'running'],
    queryFn: () => modelsService.getRunningModels(),
  });

  const unloadMutation = useMutation({
    mutationFn: modelsService.unloadModel,
    onSuccess: () => {
      toast({
        title: 'Model unloaded',
        description: 'The model has been unloaded from memory.',
      });
      queryClient.invalidateQueries({ queryKey: ['models', 'running'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Unload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRefresh} />;
  }

  if (runningModels.length === 0) {
    return <EmptyState description="No models running" />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {runningModels.map((modelId) => {
        const model = localModels.find((m) => m.id === modelId);
        return (
          <Card key={modelId}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{modelId}</p>
                  {model && (
                    <Badge className={TASK_COLORS[model.task] + ' mt-2'}>
                      {TASK_LABELS[model.task] || model.task}
                    </Badge>
                  )}
                </div>
                <ConfirmationDialogAction
                  title="Unload Model"
                  description={`Do you want to unload "${modelId}" from memory?`}
                  confirmText="Unload"
                  disableConfirm={unloadMutation.isPending}
                  onConfirm={() => unloadMutation.mutate(modelId)}
                >
                  <Button variant="ghost" size="icon">
                    <Square className="h-4 w-4 text-destructive" />
                  </Button>
                </ConfirmationDialogAction>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
