import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, BarChart3, Clock, Activity } from 'lucide-react';
import type { components } from '@/types/api';

type SpeechTimestamp = components['schemas']['SpeechTimestamp'];

interface VADStatisticsProps {
  segments: SpeechTimestamp[];
  onExport?: () => void;
  className?: string;
}

export function VADStatistics({ segments, onExport, className }: VADStatisticsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDecimal = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const calculateStatistics = () => {
    if (segments.length === 0) {
      return {
        totalSpeechDuration: 0,
        totalSilenceDuration: 0,
        numberOfSpeechSegments: 0,
        averageSpeechSegmentDuration: 0,
        averageSilenceDuration: 0,
        speechPercentage: 0,
        longestSpeechSegment: 0,
        longestSilenceGap: 0,
        totalDuration: 0,
      };
    }

    const speechDurations = segments.map((seg) => seg.end - seg.start);
    const positiveDurations = speechDurations.filter((d) => d > 0);
    const negativeDurations = speechDurations.filter((d) => d < 0);

    const totalSpeechDuration = positiveDurations.reduce((acc, d) => acc + Math.abs(d), 0);
    const totalSilenceDuration = Math.abs(negativeDurations.reduce((acc, d) => acc + d, 0));
    const numberOfSpeechSegments = positiveDurations.length;

    const averageSpeechSegmentDuration =
      numberOfSpeechSegments > 0 ? totalSpeechDuration / numberOfSpeechSegments : 0;

    const averageSilenceDuration =
      negativeDurations.length > 0 ? totalSilenceDuration / negativeDurations.length : 0;

    const totalDuration = segments[segments.length - 1].end - segments[0].start;

    const speechPercentage = totalDuration > 0 ? (totalSpeechDuration / totalDuration) * 100 : 0;

    const longestSpeechSegment = positiveDurations.length > 0 ? Math.max(...positiveDurations) : 0;
    const longestSilenceGap =
      negativeDurations.length > 0 ? Math.max(...negativeDurations.map(Math.abs)) : 0;

    return {
      totalSpeechDuration,
      totalSilenceDuration,
      numberOfSpeechSegments,
      averageSpeechSegmentDuration,
      averageSilenceDuration,
      speechPercentage,
      longestSpeechSegment,
      longestSilenceGap,
      totalDuration,
    };
  };

  const stats = calculateStatistics();

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: any;
  }) => (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Statistics</CardTitle>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Stats
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {segments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No segments to analyze. Upload a file and run VAD to see statistics.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Speech Duration"
                value={formatTime(stats.totalSpeechDuration)}
                subtitle={`${formatDecimal(stats.totalSpeechDuration, 1)} seconds`}
                icon={Clock}
              />
              <StatCard
                title="Total Silence Duration"
                value={formatTime(stats.totalSilenceDuration)}
                subtitle={`${formatDecimal(stats.totalSilenceDuration, 1)} seconds`}
                icon={Activity}
              />
              <StatCard
                title="Speech Percentage"
                value={`${formatDecimal(stats.speechPercentage, 1)}%`}
                subtitle={`${formatDecimal(stats.speechPercentage / 100, 2)} of total`}
                icon={BarChart3}
              />
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-medium">Segment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of Speech Segments:</span>
                  <span className="font-medium">{stats.numberOfSpeechSegments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Speech Duration:</span>
                  <span className="font-medium">
                    {formatTime(stats.averageSpeechSegmentDuration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Silence Duration:</span>
                  <span className="font-medium">{formatTime(stats.averageSilenceDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longest Speech Segment:</span>
                  <span className="font-medium">{formatTime(stats.longestSpeechSegment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longest Silence Gap:</span>
                  <span className="font-medium">{formatTime(stats.longestSilenceGap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Audio Duration:</span>
                  <span className="font-medium">{formatTime(stats.totalDuration)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-medium">Duration Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${stats.speechPercentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-24 text-right">
                    Speech {formatDecimal(stats.speechPercentage, 1)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all"
                        style={{ width: `${100 - stats.speechPercentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-24 text-right">
                    Silence {formatDecimal(100 - stats.speechPercentage, 1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
