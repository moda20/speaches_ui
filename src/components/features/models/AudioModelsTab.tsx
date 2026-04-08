import { useQuery } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import type { components } from '@/types/api';
import { ModelTable } from './ModelTable';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

type Model = components['schemas']['Model'];

interface AudioModelsTabProps {
  onRefresh: () => void;
}

export function AudioModelsTab({ onRefresh }: AudioModelsTabProps) {
  const {
    data: audioModels = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['models', 'audio'],
    queryFn: () => modelsService.getAudioModels(),
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRefresh} />;
  }

  if (audioModels.length === 0) {
    return <EmptyState description="No audio models found" />;
  }

  return <ModelTable models={audioModels} activeTab="audio" />;
}
