import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import type { components } from '@/types/api';
import { ModelTable } from './ModelTable';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { toast } from '@/hooks/use-toast';

type Model = components['schemas']['Model'];

interface RemoteModelsTabProps {
  taskFilter: string;
  onRefresh: () => void;
}

export function RemoteModelsTab({ taskFilter, onRefresh }: RemoteModelsTabProps) {
  const queryClient = useQueryClient();

  const {
    data: remoteModels = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['models', 'remote', taskFilter],
    queryFn: () => modelsService.getRemoteModels(taskFilter === 'all' ? undefined : taskFilter),
  });

  const downloadMutation = useMutation({
    mutationFn: modelsService.downloadModel,
    onSuccess: () => {
      toast({
        title: 'Download started',
        description: 'Model download has been initiated.',
      });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Download failed',
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

  if (remoteModels.length === 0) {
    return <EmptyState description="No remote models found" />;
  }

  return (
    <ModelTable models={remoteModels} activeTab="remote" downloadMutation={downloadMutation} />
  );
}
