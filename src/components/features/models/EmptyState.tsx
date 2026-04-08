import { CheckCircle2 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = 'No models found', description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{description || title}</p>
    </div>
  );
}
