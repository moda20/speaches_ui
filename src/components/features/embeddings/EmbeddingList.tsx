import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Search, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface EmbeddingData {
  id: string;
  fileName: string;
  timestamp: number;
  embedding: number[];
  model: string;
  dimension: number;
}

interface EmbeddingListProps {
  embeddings: EmbeddingData[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => void;
  onExport?: (ids: string[]) => void;
  className?: string;
}

export function EmbeddingList({
  embeddings,
  selectedIds,
  onSelect,
  onDelete,
  onExport,
  className,
}: EmbeddingListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmbeddings = embeddings.filter(
    (emb) =>
      emb.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emb.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected =
    filteredEmbeddings.length > 0 && filteredEmbeddings.every((e) => selectedIds.has(e.id));

  const handleSelectAll = (checked: boolean) => {
    filteredEmbeddings.forEach((emb) => onSelect(emb.id, checked));
  };

  const handleExportSelected = () => {
    if (onExport) {
      const selected = filteredEmbeddings.filter((e) => selectedIds.has(e.id));
      onExport(selected.map((e) => e.id));
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generated Embeddings</CardTitle>
          <Badge variant="secondary">{embeddings.length} embeddings</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search embeddings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedIds.size > 0 && onExport && (
            <Button variant="outline" size="sm" onClick={handleExportSelected}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected ({selectedIds.size})
            </Button>
          )}
        </div>

        {filteredEmbeddings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No embeddings match your search' : 'No embeddings generated yet'}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all embeddings"
                    />
                  </TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Dimension</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmbeddings.map((emb) => (
                  <TableRow key={emb.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(emb.id)}
                        onCheckedChange={(checked) => onSelect(emb.id, checked as boolean)}
                        aria-label={`Select embedding ${emb.fileName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{emb.fileName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{emb.model}</Badge>
                    </TableCell>
                    <TableCell>{emb.dimension}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimestamp(emb.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(emb.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

import { useState } from 'react';
