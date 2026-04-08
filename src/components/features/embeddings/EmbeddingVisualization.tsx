import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Copy, Maximize2 } from 'lucide-react';

export interface EmbeddingData {
  id: string;
  fileName: string;
  embedding: number[];
  model: string;
  timestamp: number;
}

interface EmbeddingVisualizationProps {
  embeddings: EmbeddingData[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onExport?: (id: string) => void;
  className?: string;
}

export function EmbeddingVisualization({
  embeddings,
  selectedId,
  onSelect,
  onExport,
  className,
}: EmbeddingVisualizationProps) {
  const handleCopyVector = (embedding: number[]) => {
    const vectorStr = `[${embedding.map((v) => v.toFixed(6)).join(', ')}]`;
    navigator.clipboard.writeText(vectorStr);
  };

  const handleExportJSON = (embedding: EmbeddingData) => {
    const data = {
      id: embedding.id,
      fileName: embedding.fileName,
      model: embedding.model,
      timestamp: embedding.timestamp,
      dimension: embedding.embedding.length,
      embedding: embedding.embedding,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `embedding-${embedding.fileName}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (embedding: EmbeddingData) => {
    const header = 'Index,Value\n';
    const rows = embedding.embedding.map((val, idx) => `${idx},${val.toFixed(10)}`).join('\n');
    const csvContent = header + rows;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `embedding-${embedding.fileName}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const calculateStatistics = (embedding: number[]) => {
    const mean = embedding.reduce((a, b) => a + b, 0) / embedding.length;
    const variance = embedding.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / embedding.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...embedding);
    const max = Math.max(...embedding);

    return { mean, stdDev, min, max };
  };

  const selectedEmbedding = embeddings.find((e) => e.id === selectedId);
  const stats = selectedEmbedding ? calculateStatistics(selectedEmbedding.embedding) : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Embedding Visualization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedEmbedding ? (
          <div className="text-center py-8 text-muted-foreground">
            Select an embedding from the list to view its details
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{selectedEmbedding.fileName}</h3>
                <Badge variant="outline">{selectedEmbedding.model}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Created: {formatTimestamp(selectedEmbedding.timestamp)}
              </p>
            </div>

            {stats && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Dimension</p>
                  <p className="text-sm font-medium">{selectedEmbedding.embedding.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mean</p>
                  <p className="text-sm font-medium">{stats.mean.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Std Dev</p>
                  <p className="text-sm font-medium">{stats.stdDev.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Range</p>
                  <p className="text-sm font-medium">
                    [{stats.min.toFixed(4)}, {stats.max.toFixed(4)}]
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Embedding Vector</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyVector(selectedEmbedding.embedding)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportJSON(selectedEmbedding)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(selectedEmbedding)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-48 border rounded-md p-3">
                <div className="grid grid-cols-8 gap-1 text-xs font-mono">
                  {selectedEmbedding.embedding.map((val, idx) => (
                    <div
                      key={idx}
                      className={`p-1 rounded text-center transition-colors ${
                        val > 0
                          ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
                          : 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100'
                      }`}
                      style={{
                        opacity: 0.3 + Math.abs(val) * 0.7,
                      }}
                      title={`Index ${idx}: ${val.toFixed(6)}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Visual Distribution</h4>
              <div className="h-16 bg-muted rounded-lg p-2 flex items-end justify-between gap-px">
                {selectedEmbedding.embedding
                  .filter((_, i) => i % Math.ceil(selectedEmbedding.embedding.length / 50) === 0)
                  .map((val, i) => {
                    const normalized = Math.abs(val);
                    const height = Math.max(4, normalized * 100);
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all"
                        style={{
                          height: `${height}%`,
                          backgroundColor: val > 0 ? 'rgb(34 197 94)' : 'rgb(239 68 68)',
                        }}
                        title={`Value: ${val.toFixed(4)}`}
                      />
                    );
                  })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Negative</span>
                <span>Positive</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
