import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, Play, Copy, Download, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { TranscriptionResult } from '@/services/transcription';

interface Segment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

interface SegmentListProps {
  result: TranscriptionResult;
  onSegmentClick?: (segment: Segment) => void;
  activeSegmentId?: number;
}

export function SegmentList({ result, onSegmentClick, activeSegmentId }: SegmentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'high-confidence' | 'low-confidence'>('all');
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());

  if (!result.segments || result.segments.length === 0) {
    return null;
  }

  const formatTimestamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const formatDuration = (start: number, end: number) => {
    const duration = end - start;
    return `${duration.toFixed(2)}s`;
  };

  const filteredSegments = result.segments
    .filter((segment) => {
      const matchesSearch =
        segment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.id.toString().includes(searchTerm);

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'high-confidence' && segment.avg_logprob > -0.5) ||
        (filterType === 'low-confidence' && segment.avg_logprob <= -0.5);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      return sortOrder === 'asc' ? a.start - b.start : b.start - a.start;
    });

  const handleSegmentClick = (segment: Segment) => {
    onSegmentClick?.(segment);
  };

  const handleSegmentSelect = (segmentId: number) => {
    setSelectedSegments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId);
      } else {
        newSet.add(segmentId);
      }
      return newSet;
    });
  };

  const handleCopySegment = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Segment text has been copied.',
    });
  };

  const handleDownloadSelected = () => {
    if (selectedSegments.size === 0) {
      toast({
        title: 'No segments selected',
        description: 'Please select segments to download.',
        variant: 'destructive',
      });
      return;
    }

    const selectedSegmentData = (result.segments || [])
      .filter((seg) => selectedSegments.has(seg.id))
      .map((seg) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text,
      }));

    const content = JSON.stringify(selectedSegmentData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'segments.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: `${selectedSegments.size} segment(s) downloaded.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Segments ({filteredSegments.length})
          </CardTitle>
          {selectedSegments.size > 0 && (
            <Button size="sm" onClick={handleDownloadSelected}>
              <Download className="h-4 w-4 mr-2" />
              Download ({selectedSegments.size})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search segments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Oldest First</SelectItem>
              <SelectItem value="desc">Newest First</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high-confidence">High Confidence</SelectItem>
              <SelectItem value="low-confidence">Low Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <ScrollArea className="h-[400px]">
          <div className="space-y-2 pr-4">
            {filteredSegments.map((segment) => {
              const isActive = activeSegmentId === segment.id;
              const isSelected = selectedSegments.has(segment.id);
              const confidencePercent = Math.round((segment.avg_logprob + 1) * 50);
              const confidenceColor =
                confidencePercent >= 70
                  ? 'text-green-600'
                  : confidencePercent >= 40
                    ? 'text-yellow-600'
                    : 'text-red-600';

              return (
                <div
                  key={segment.id}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={(e) => {
                    if (e.target !== e.currentTarget) return;
                    handleSegmentClick(segment);
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSegmentSelect(segment.id);
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(segment.start, segment.end)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${confidenceColor}`}>
                        {confidencePercent}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSegmentClick(segment);
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopySegment(segment.text);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{segment.text}</p>
                  <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                    {segment.temperature > 0 && <span>Temp: {segment.temperature.toFixed(2)}</span>}
                    {segment.compression_ratio > 0 && (
                      <span>Comp: {segment.compression_ratio.toFixed(2)}</span>
                    )}
                    {segment.no_speech_prob > 0 && (
                      <span>No Speech: {(segment.no_speech_prob * 100).toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
