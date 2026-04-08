import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export type TimestampGranularity = 'segment' | 'word' | 'both';
export type TimestampFormat = 'hms' | 'seconds' | 'ms';

interface TimestampControlsProps {
  granularity: TimestampGranularity;
  format: TimestampFormat;
  showTimestamps: boolean;
  highlightActiveSegment: boolean;
  onGranularityChange: (value: TimestampGranularity) => void;
  onFormatChange: (value: TimestampFormat) => void;
  onShowTimestampsChange: (value: boolean) => void;
  onHighlightActiveSegmentChange: (value: boolean) => void;
}

export function TimestampControls({
  granularity,
  format,
  showTimestamps,
  highlightActiveSegment,
  onGranularityChange,
  onFormatChange,
  onShowTimestampsChange,
  onHighlightActiveSegmentChange,
}: TimestampControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Timestamp Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-timestamps"
            checked={showTimestamps}
            onCheckedChange={(checked) => onShowTimestampsChange(checked as boolean)}
          />
          <Label htmlFor="show-timestamps" className="text-sm font-normal cursor-pointer">
            Show timestamps in output
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="highlight-segment"
            checked={highlightActiveSegment}
            onCheckedChange={(checked) => onHighlightActiveSegmentChange(checked as boolean)}
          />
          <Label htmlFor="highlight-segment" className="text-sm font-normal cursor-pointer">
            Highlight active segment during playback
          </Label>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Timestamp Granularity</Label>
          <Select
            value={granularity}
            onValueChange={(value) => onGranularityChange(value as TimestampGranularity)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="segment">Segment Level</SelectItem>
              <SelectItem value="word">Word Level</SelectItem>
              <SelectItem value="both">Both Segments and Words</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Timestamp Format</Label>
          <Select
            value={format}
            onValueChange={(value) => onFormatChange(value as TimestampFormat)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hms">HH:MM:SS.mmm</SelectItem>
              <SelectItem value="seconds">Seconds (e.g., 123.456)</SelectItem>
              <SelectItem value="ms">Milliseconds</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
