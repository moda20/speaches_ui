import React from 'react';
import { Button } from '@/components/ui/button';
import { FileAudio, X, Download, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FileListProps {
  files: Array<{
    id: string;
    name: string;
    size: number;
    status: 'uploaded' | 'processing' | 'completed' | 'error';
    url?: string;
    error?: string;
  }>;
  onRemove?: (id: string) => void;
  onDownload?: (id: string) => void;
  onPlay?: (id: string) => void;
  className?: string;
}

export function FileList({ files, onRemove, onDownload, onPlay, className }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      uploaded: 'default',
      processing: 'secondary',
      completed: 'outline',
      error: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (files.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <FileAudio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No files uploaded yet</p>
      </Card>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {files.map((file) => (
        <Card key={file.id} className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileAudio className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                  {getStatusBadge(file.status)}
                </div>
                {file.error && <p className="text-xs text-destructive mt-1">{file.error}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {file.status === 'completed' && file.url && (
                <>
                  {onPlay && (
                    <Button variant="ghost" size="icon" onClick={() => onPlay(file.id)}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {onDownload && (
                    <Button variant="ghost" size="icon" onClick={() => onDownload(file.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
              {onRemove && (
                <Button variant="ghost" size="icon" onClick={() => onRemove(file.id)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
