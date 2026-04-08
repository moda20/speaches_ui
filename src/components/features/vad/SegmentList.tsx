import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Play, SortAsc, SortDesc, Filter } from 'lucide-react';
import type { components } from '@/types/api';

type SpeechTimestamp = components['schemas']['SpeechTimestamp'];

interface SegmentListProps {
  segments: SpeechTimestamp[];
  audioUrl?: string;
  onSegmentPlay?: (startTime: number, endTime: number) => void;
  selectedSegments?: Set<number>;
  onSegmentSelect?: (index: number, selected: boolean) => void;
  className?: string;
}

type SortBy = 'start' | 'end' | 'duration';
type SortOrder = 'asc' | 'desc';

export function SegmentList({
  segments,
  audioUrl,
  onSegmentPlay,
  selectedSegments = new Set(),
  onSegmentSelect,
  className,
}: SegmentListProps) {
  const [sortBy, setSortBy] = useState<SortBy>('start');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filter, setFilter] = useState<'all' | 'speech' | 'silence'>('all');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const calculateDuration = (start: number, end: number) => {
    return end - start;
  };

  const sortSegments = (segs: SpeechTimestamp[]) => {
    const sorted = [...segs];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'start') {
        comparison = a.start - b.start;
      } else if (sortBy === 'end') {
        comparison = a.end - b.end;
      } else if (sortBy === 'duration') {
        comparison = calculateDuration(a.start, a.end) - calculateDuration(b.start, b.end);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  };

  const filteredSegments = sortSegments(segments).filter((segment) => {
    if (filter === 'all') return true;
    const duration = calculateDuration(segment.start, segment.end);
    if (filter === 'speech') return duration > 0;
    if (filter === 'silence') return duration <= 0;
    return true;
  });

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePlaySegment = (segment: SpeechTimestamp, index: number) => {
    if (onSegmentPlay) {
      onSegmentPlay(segment.start, segment.end);
    }
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    if (onSegmentSelect) {
      onSegmentSelect(index, checked);
    }
  };

  const allSelected =
    filteredSegments.length > 0 && filteredSegments.every((_, i) => selectedSegments.has(i));

  const handleSelectAll = (checked: boolean) => {
    if (onSegmentSelect) {
      filteredSegments.forEach((_, i) => onSegmentSelect(i, checked));
    }
  };

  const totalSpeechDuration = segments.reduce(
    (acc, seg) => acc + Math.max(0, seg.end - seg.start),
    0
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Detected Segments</CardTitle>
          <Badge variant="secondary">{filteredSegments.length} segments</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Filter segments..."
              value={filter === 'all' ? '' : filter}
              onChange={(e) => {
                const val = e.target.value.toLowerCase();
                if (val === 'all' || val === '') setFilter('all');
                else if (val.includes('speech')) setFilter('speech');
                else if (val.includes('silence')) setFilter('silence');
              }}
            />
          </div>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'speech' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('speech')}
          >
            Speech
          </Button>
          <Button
            variant={filter === 'silence' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('silence')}
          >
            Silence
          </Button>
        </div>

        {segments.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total Speech Duration:</span>
            <Badge variant="outline">{formatTime(totalSpeechDuration)}</Badge>
          </div>
        )}

        {filteredSegments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No segments found</div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all segments"
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('start')}
                      className="h-auto p-0 font-medium"
                    >
                      Start Time
                      {sortBy === 'start' &&
                        (sortOrder === 'asc' ? (
                          <SortAsc className="ml-1 h-3 w-3" />
                        ) : (
                          <SortDesc className="ml-1 h-3 w-3" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('end')}
                      className="h-auto p-0 font-medium"
                    >
                      End Time
                      {sortBy === 'end' &&
                        (sortOrder === 'asc' ? (
                          <SortAsc className="ml-1 h-3 w-3" />
                        ) : (
                          <SortDesc className="ml-1 h-3 w-3" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('duration')}
                      className="h-auto p-0 font-medium"
                    >
                      Duration
                      {sortBy === 'duration' &&
                        (sortOrder === 'asc' ? (
                          <SortAsc className="ml-1 h-3 w-3" />
                        ) : (
                          <SortDesc className="ml-1 h-3 w-3" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSegments.map((segment, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSegments.has(index)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(index, checked as boolean)
                        }
                        aria-label={`Select segment ${index + 1}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{formatTime(segment.start)}</TableCell>
                    <TableCell className="font-mono text-sm">{formatTime(segment.end)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatTime(calculateDuration(segment.start, segment.end))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlaySegment(segment, index)}
                        disabled={!audioUrl}
                      >
                        <Play className="h-4 w-4" />
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
