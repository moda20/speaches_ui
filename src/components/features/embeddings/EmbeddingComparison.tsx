import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Maximize, Minimize, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface EmbeddingData {
  id: string;
  fileName: string;
  embedding: number[];
}

interface EmbeddingComparisonProps {
  embeddings: EmbeddingData[];
  selectedIds: Set<string>;
  className?: string;
}

type SimilarityMethod = 'cosine' | 'euclidean' | 'dot';

export function EmbeddingComparison({
  embeddings,
  selectedIds,
  className,
}: EmbeddingComparisonProps) {
  const [similarityMethod, setSimilarityMethod] = useState<SimilarityMethod>('cosine');
  const [threshold, setThreshold] = useState(0.5);
  const [showAll, setShowAll] = useState(false);

  const selectedEmbeddings = embeddings.filter((e) => selectedIds.has(e.id));

  const cosineSimilarity = (a: number[], b: number[]): number => {
    const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
    return magnitudeA * magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
  };

  const euclideanDistance = (a: number[], b: number[]): number => {
    const sumSquares = a.reduce((acc, val, i) => acc + Math.pow(val - b[i], 2), 0);
    return Math.sqrt(sumSquares);
  };

  const dotProduct = (a: number[], b: number[]): number => {
    return a.reduce((acc, val, i) => acc + val * b[i], 0);
  };

  const calculateSimilarity = (a: number[], b: number[]): number => {
    switch (similarityMethod) {
      case 'cosine':
        return cosineSimilarity(a, b);
      case 'euclidean':
        const dist = euclideanDistance(a, b);
        return 1 / (1 + dist); // Convert distance to similarity (0-1)
      case 'dot':
        return dotProduct(a, b);
      default:
        return 0;
    }
  };

  const comparisons = selectedEmbeddings
    .flatMap((emb1, i) =>
      selectedEmbeddings.slice(i + 1).map((emb2) => ({
        id1: emb1.id,
        name1: emb1.fileName,
        id2: emb2.id,
        name2: emb2.fileName,
        similarity: calculateSimilarity(emb1.embedding, emb2.embedding),
      }))
    )
    .filter((c) => showAll || Math.abs(c.similarity) >= threshold)
    .sort((a, b) => Math.abs(b.similarity) - Math.abs(a.similarity));

  const getSimilarityColor = (similarity: number) => {
    const abs = Math.abs(similarity);
    if (abs >= 0.8) return 'text-green-600';
    if (abs >= 0.6) return 'text-yellow-600';
    if (abs >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSimilarityBadge = (similarity: number) => {
    const abs = Math.abs(similarity);
    if (abs >= 0.8) return 'default';
    if (abs >= 0.6) return 'secondary';
    if (abs >= 0.4) return 'outline';
    return 'destructive';
  };

  const formatValue = (val: number): string => {
    return val.toFixed(4);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Embedding Comparison</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Select 2+ embeddings to compare their similarity using different methods. Higher
                  values indicate greater similarity.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label>Similarity Method</Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={similarityMethod === 'cosine' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSimilarityMethod('cosine')}
              >
                Cosine
              </Button>
              <Button
                variant={similarityMethod === 'euclidean' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSimilarityMethod('euclidean')}
              >
                Euclidean
              </Button>
              <Button
                variant={similarityMethod === 'dot' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSimilarityMethod('dot')}
              >
                Dot Product
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Similarity Threshold</Label>
              <span className="text-xs text-muted-foreground">{threshold.toFixed(2)}</span>
            </div>
            <Slider
              value={[threshold]}
              onValueChange={([value]) => setThreshold(value)}
              min={0}
              max={1}
              step={0.05}
              className="cursor-pointer"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? (
              <>
                <Minimize className="h-4 w-4 mr-2" />
                Show High Similarity Only
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4 mr-2" />
                Show All Comparisons
              </>
            )}
          </Button>
        </div>

        {selectedEmbeddings.length < 2 ? (
          <div className="text-center py-8 text-muted-foreground">
            Select at least 2 embeddings to compare
          </div>
        ) : comparisons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comparisons meet the threshold. Try lowering it or show all comparisons.
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Embedding 1</TableHead>
                  <TableHead className="text-center">
                    <ArrowRight className="h-4 w-4 mx-auto" />
                  </TableHead>
                  <TableHead>Embedding 2</TableHead>
                  <TableHead className="text-right">Similarity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map((comp, index) => (
                  <TableRow key={`${comp.id1}-${comp.id2}`}>
                    <TableCell className="font-medium">{comp.name1}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getSimilarityBadge(comp.similarity)}>
                        {formatValue(comp.similarity)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{comp.name2}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${getSimilarityColor(comp.similarity)}`}
                    >
                      {formatValue(comp.similarity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
