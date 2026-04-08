import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FileUploadProgressProps {
  progress: number;
  fileName?: string;
  status?: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  className?: string;
}

export function FileUploadProgress({
  progress,
  fileName,
  status = 'uploading',
  error,
  className,
}: FileUploadProgressProps) {
  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return error || 'An error occurred';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-primary';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      {fileName && <p className="text-sm font-medium mb-2">{fileName}</p>}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{getStatusText()}</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </Card>
  );
}
