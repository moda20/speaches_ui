import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileAudio, File } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File;
  accept?: string;
  maxSize?: number;
  uploadProgress?: number;
  isUploading?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = 'audio/*',
  maxSize = 100 * 1024 * 1024,
  uploadProgress = 0,
  isUploading = false,
  className,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !isUploading) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, isUploading]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.webm'] },
    maxSize,
    multiple: false,
    disabled: isUploading,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <FileAudio className="h-10 w-10 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              {isUploading && (
                <div className="mt-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
          {!isUploading && onFileRemove && (
            <Button variant="ghost" size="icon" onClick={onFileRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      {...getRootProps()}
      className={`p-8 border-2 border-dashed transition-colors cursor-pointer ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : isDragReject
            ? 'border-destructive bg-destructive/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
      } ${className}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Drop the audio file here'
              : 'Drag & drop audio file, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports MP3, WAV, FLAC, M4A, OGG, WEBM (max {formatFileSize(maxSize)})
          </p>
        </div>
      </div>
    </Card>
  );
}
