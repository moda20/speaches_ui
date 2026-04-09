import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import { embeddingsService, type EmbeddingResult } from '@/services/embeddings';
import { PageHeader } from '@/components/layout/PageHeader';
import { FileUpload } from '@/components/features/upload/FileUpload';
import { AudioPlayer } from '@/components/features/audio/AudioPlayer';
import { EmbeddingList, type EmbeddingData } from '@/components/features/embeddings/EmbeddingList';
import { EmbeddingComparison } from '@/components/features/embeddings/EmbeddingComparison';
import { EmbeddingVisualization } from '@/components/features/embeddings/EmbeddingVisualization';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Sparkles, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export default function Embeddings() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedEmbeddingId, setSelectedEmbeddingId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [embeddingsHistory, setEmbeddingsHistory] = useState<EmbeddingData[]>([]);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const { data: models = [] } = useQuery({
    queryKey: ['models', 'embedding', currentWorkspaceId],
    queryFn: () => modelsService.getLocalModels(),
  });

  const embeddingModels = models.filter(
    (m) => m.task === 'speaker-embedding' || m.id.includes('embed')
  );

  useEffect(() => {
    if (embeddingModels.length > 0 && !selectedModel) {
      setSelectedModel(embeddingModels[0].id);
    }
  }, [embeddingModels, selectedModel]);

  const generateMutation = useMutation({
    mutationFn: async (file: File) => {
      return await embeddingsService.createSpeechEmbedding(file, selectedModel);
    },
    onSuccess: (result, file) => {
      const newEmbedding: EmbeddingData = {
        id: result.audio_id || `emb-${Date.now()}`,
        fileName: file.name,
        timestamp: Date.now(),
        embedding: result.embedding,
        model: result.model,
        dimension: result.embedding.length,
      };
      setEmbeddingsHistory((prev) => [...prev, newEmbedding]);
      setSelectedEmbeddingId(newEmbedding.id);
      toast({
        title: 'Embedding Generated',
        description: `Created ${result.embedding.length}-dimensional embedding for ${file.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Embedding Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const batchMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const results = await Promise.all(
        files.map((file) => embeddingsService.createSpeechEmbedding(file, selectedModel))
      );
      return results;
    },
    onSuccess: (results, files) => {
      const newEmbeddings: EmbeddingData[] = results.map((result, index) => ({
        id: result.audio_id || `emb-${Date.now()}-${index}`,
        fileName: files[index].name,
        timestamp: Date.now(),
        embedding: result.embedding,
        model: result.model,
        dimension: result.embedding.length,
      }));
      setEmbeddingsHistory((prev) => [...prev, ...newEmbeddings]);
      toast({
        title: 'Batch Processing Complete',
        description: `Generated ${newEmbeddings.length} embeddings`,
      });
      setBatchFiles([]);
      setIsBatchMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Batch Processing Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGenerate = () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select an audio file first',
        variant: 'destructive',
      });
      return;
    }
    generateMutation.mutate(selectedFile);
  };

  const handleBatchGenerate = () => {
    if (batchFiles.length === 0) {
      toast({
        title: 'No Files Selected',
        description: 'Please select audio files for batch processing',
        variant: 'destructive',
      });
      return;
    }
    batchMutation.mutate(batchFiles);
  };

  const handleSelectEmbedding = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleDeleteEmbedding = (id: string) => {
    setEmbeddingsHistory((prev) => prev.filter((e) => e.id !== id));
    if (selectedEmbeddingId === id) {
      setSelectedEmbeddingId('');
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast({
      title: 'Embedding Deleted',
      description: 'The embedding has been removed from history',
    });
  };

  const handleExportSelected = (ids: string[]) => {
    const selectedEmbeddings = embeddingsHistory.filter((e) => ids.includes(e.id));
    const data = {
      timestamp: Date.now(),
      count: selectedEmbeddings.length,
      embeddings: selectedEmbeddings.map((e) => ({
        id: e.id,
        fileName: e.fileName,
        model: e.model,
        dimension: e.dimension,
        embedding: e.embedding,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `embeddings-batch-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${selectedEmbeddings.length} embeddings`,
    });
  };

  const handleExportAll = () => {
    const data = {
      timestamp: Date.now(),
      count: embeddingsHistory.length,
      embeddings: embeddingsHistory.map((e) => ({
        id: e.id,
        fileName: e.fileName,
        model: e.model,
        dimension: e.dimension,
        embedding: e.embedding,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `embeddings-all-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const audioUrl = selectedFile ? URL.createObjectURL(selectedFile) : undefined;

  return (
    <div className="container mx-auto p-4 pl-2 space-y-6">
      <PageHeader
        title="Speaker Embeddings"
        description="Create and analyze speaker embeddings from audio files"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {!isBatchMode ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Single File Processing</h3>
                  <Button variant="outline" size="sm" onClick={() => setIsBatchMode(true)}>
                    Switch to Batch Mode
                  </Button>
                </div>

                <FileUpload
                  onFileSelect={setSelectedFile}
                  onFileRemove={() => setSelectedFile(null)}
                  selectedFile={selectedFile || undefined}
                  isUploading={generateMutation.isPending}
                />

                {selectedFile && audioUrl && (
                  <AudioPlayer
                    src={audioUrl}
                    title={selectedFile.name}
                    onDownload={() => {
                      if (selectedFile) {
                        const url = URL.createObjectURL(selectedFile);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = selectedFile.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }
                    }}
                  />
                )}

                <div>
                  <Label>Model</Label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    disabled={generateMutation.isPending}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {embeddingModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!selectedFile || generateMutation.isPending}
                  className="w-full"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Embedding
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Batch Processing</h3>
                  <Button variant="outline" size="sm" onClick={() => setIsBatchMode(false)}>
                    Switch to Single File
                  </Button>
                </div>

                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-medium mb-2">Drop multiple audio files here</p>
                  <Input
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setBatchFiles(files);
                    }}
                    className="max-w-xs mx-auto"
                  />
                  {batchFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">{batchFiles.length} files selected:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {batchFiles.map((file, idx) => (
                          <li key={idx}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Model</Label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    disabled={batchMutation.isPending}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {embeddingModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleBatchGenerate}
                  disabled={batchFiles.length === 0 || batchMutation.isPending}
                  className="w-full"
                >
                  {batchMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing {batchFiles.length} files...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Process Batch ({batchFiles.length} files)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          <EmbeddingList
            embeddings={embeddingsHistory}
            selectedIds={selectedIds}
            onSelect={handleSelectEmbedding}
            onDelete={handleDeleteEmbedding}
            onExport={handleExportSelected}
          />

          {embeddingsHistory.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full" onClick={handleExportAll}>
                  <Download className="h-4 w-4 mr-2" />
                  Export All Embeddings ({embeddingsHistory.length})
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <EmbeddingVisualization
            embeddings={embeddingsHistory}
            selectedId={selectedEmbeddingId}
            onSelect={setSelectedEmbeddingId}
          />

          <EmbeddingComparison embeddings={embeddingsHistory} selectedIds={selectedIds} />
        </div>
      </div>
    </div>
  );
}
