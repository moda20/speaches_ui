import { useQuery } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

interface VoicesTabProps {
  onRefresh: () => void;
}

export function VoicesTab({ onRefresh }: VoicesTabProps) {
  const {
    data: voices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['models', 'voices'],
    queryFn: () => modelsService.getAudioVoices(),
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRefresh} />;
  }

  if (voices.length === 0) {
    return <EmptyState description="No voices found" />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {voices.map((voice) => (
        <Card key={voice}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">{voice[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{voice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
