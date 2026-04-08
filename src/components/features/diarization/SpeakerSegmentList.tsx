import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Play, Search, Edit, Merge, Split } from 'lucide-react';
import { DiarizationSegment } from '@/services/diarization';

interface SpeakerSegmentListProps {
  segments: DiarizationSegment[];
  speakerNames?: Map<string, string>;
  audioUrl?: string;
  onSegmentPlay?: (startTime: number, endTime: number) => void;
  onSpeakerNameChange?: (speakerId: string, newName: string) => void;
  onMergeSegments?: (indices: number[]) => void;
  onSplitSegment?: (index: number, time: number) => void;
  selectedSegments?: Set<number>;
  onSegmentSelect?: (index: number, selected: boolean) => void;
  className?: string;
}

const SPEAKER_COLORS: Record<string, string> = {
  SPEAKER_00: 'bg-blue-500',
  SPEAKER_01: 'bg-green-500',
  SPEAKER_02: 'bg-purple-500',
  SPEAKER_03: 'bg-orange-500',
  SPEAKER_04: 'bg-pink-500',
};

export function SpeakerSegmentList({
  segments,
  speakerNames,
  audioUrl,
  onSegmentPlay,
  onSpeakerNameChange,
  onMergeSegments,
  onSplitSegment,
  selectedSegments,
  onSegmentSelect,
  className,
}: SpeakerSegmentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [newSpeakerName, setNewSpeakerName] = useState('');

  const getSpeakerName = (speakerId: string) => {
    return speakerNames?.get(speakerId) || speakerId;
  };

  const getSpeakerColor = (speakerId: string) => {
    return SPEAKER_COLORS[speakerId] || 'bg-gray-500';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const filteredSegments = segments.filter((seg) => {
    const query = searchQuery.toLowerCase();
    return (
      getSpeakerName(seg.speaker).toLowerCase().includes(query) ||
      seg.speaker.toLowerCase().includes(query)
    );
  });

  const handleEditSpeaker = (speakerId: string) => {
    setEditingSpeaker(speakerId);
    setNewSpeakerName(getSpeakerName(speakerId));
  };

  const handleSaveSpeakerName = () => {
    if (editingSpeaker && onSpeakerNameChange && newSpeakerName.trim()) {
      onSpeakerNameChange(editingSpeaker, newSpeakerName.trim());
      setEditingSpeaker(null);
      setNewSpeakerName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSpeaker(null);
    setNewSpeakerName('');
  };

  const handlePlaySegment = (segment: DiarizationSegment, index: number) => {
    if (onSegmentPlay) {
      onSegmentPlay(segment.start, segment.end);
    }
  };

  const allSelected =
    filteredSegments.length > 0 && filteredSegments.every((_, i) => selectedSegments?.has(i));

  const handleSelectAll = (checked: boolean) => {
    if (onSegmentSelect) {
      filteredSegments.forEach((_, i) => onSegmentSelect(i, checked));
    }
  };

  const handleMergeSelected = () => {
    if (onMergeSegments && selectedSegments && selectedSegments.size >= 2) {
      const indices = Array.from(selectedSegments);
      onMergeSegments(indices);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Speaker Segments</CardTitle>
          <Badge variant="secondary">{filteredSegments.length} segments</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search segments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedSegments && selectedSegments.size >= 2 && onMergeSegments && (
            <Button variant="outline" size="sm" onClick={handleMergeSelected}>
              <Merge className="h-4 w-4 mr-2" />
              Merge Selected ({selectedSegments.size})
            </Button>
          )}
        </div>

        {filteredSegments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No segments match your search' : 'No segments found'}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Speaker</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSegments.map((segment, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedSegments?.has(index) || false}
                        onChange={(e) => onSegmentSelect?.(index, e.target.checked)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      {editingSpeaker === segment.speaker ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={newSpeakerName}
                            onChange={(e) => setNewSpeakerName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveSpeakerName();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="h-8"
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveSpeakerName}
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleCancelEdit}
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getSpeakerColor(segment.speaker)}`}
                          />
                          <span className="font-medium">{getSpeakerName(segment.speaker)}</span>
                          <Button
                            size="sm"
                            onClick={() => handleEditSpeaker(segment.speaker)}
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{formatTime(segment.start)}</TableCell>
                    <TableCell className="font-mono text-sm">{formatTime(segment.end)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatTime(segment.end - segment.start)}
                    </TableCell>
                    <TableCell>
                      {segment.confidence !== undefined && (
                        <Badge variant="outline">{(segment.confidence * 100).toFixed(1)}%</Badge>
                      )}
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
