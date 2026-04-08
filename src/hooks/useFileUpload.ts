import { useState, useCallback } from 'react';

interface UseFileUploadReturn {
  selectedFile: File | null;
  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
  selectFile: (file: File) => void;
  removeFile: () => void;
  uploadFile: (
    uploadFn: (file: File, onProgress?: (progress: number) => void) => Promise<void>
  ) => Promise<void>;
  reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadProgress(0);
    setError(null);
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
    setError(null);
  }, []);

  const uploadFile = useCallback(
    async (uploadFn: (file: File, onProgress?: (progress: number) => void) => Promise<void>) => {
      if (!selectedFile) {
        setError('No file selected');
        return;
      }

      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        await uploadFn(selectedFile, (progress) => {
          setUploadProgress(progress);
        });
        setUploadProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setUploadProgress(0);
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFile]
  );

  const reset = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  return {
    selectedFile,
    uploadProgress,
    isUploading,
    error,
    selectFile,
    removeFile,
    uploadFile,
    reset,
  };
}
