import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import type { components } from '@/types/api';
import { ModelTable } from './ModelTable';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { toast } from '@/hooks/use-toast';

type Model = components['schemas']['Model'];

interface LocalModelsTabProps {
  taskFilter: string;
  onRefresh: () => void;
}

export function LocalModelsTab({ taskFilter, onRefresh }: LocalModelsTabProps) {
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const { data: runningModels = [] } = useQuery({
    queryKey: ['models', 'running'],
    queryFn: () => modelsService.getRunningModels(),
  });

  const {
    data: localModels = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['models', 'local', taskFilter],
    queryFn: () => modelsService.getLocalModels(taskFilter === 'all' ? undefined : taskFilter),
  });

  const deleteMutation = useMutation({
    mutationFn: modelsService.deleteModel,
    onSuccess: () => {
      toast({
        title: 'Model deleted',
        description: 'The model has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const loadMutation = useMutation({
    mutationFn: modelsService.loadModel,
    onSuccess: () => {
      toast({
        title: 'Model loaded',
        description: 'The model has been loaded into memory.',
      });
      queryClient.invalidateQueries({ queryKey: ['models', 'running'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Load failed',
        description: error.message,
        variant: 'destructive',
      });
    },
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

  if (localModels.length === 0) {
    return <EmptyState description="No local models found" />;
  }

  return (
    <ModelTable
      models={localModels}
      activeTab="local"
      runningModels={runningModels}
      loadMutation={loadMutation}
      unloadMutation={unloadMutation}
      deleteMutation={deleteMutation}
      selectedModel={selectedModel}
      onSelectModel={setSelectedModel}
    />
  );
}
