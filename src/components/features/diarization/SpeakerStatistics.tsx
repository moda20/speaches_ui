import { DiarizationSegment } from '@/services/diarization';

interface SpeakerStatisticsProps {
  segments: DiarizationSegment[];
  speakerNames?: Map<string, string>;
  className?: string;
}

export function SpeakerStatistics({ segments, speakerNames, className }: SpeakerStatisticsProps) {
  const getSpeakerName = (speakerId: string) => {
    return speakerNames?.get(speakerId) || speakerId;
  };

  const calculateStatistics = () => {
    const speakerStats = new Map<
      string,
      { totalDuration: number; segmentCount: number; segments: DiarizationSegment[] }
    >();

    segments.forEach((seg) => {
      const duration = seg.end - seg.start;
      const stats = speakerStats.get(seg.speaker) || {
        totalDuration: 0,
        segmentCount: 0,
        segments: [],
      };
      stats.totalDuration += duration;
      stats.segmentCount += 1;
      stats.segments.push(seg);
      speakerStats.set(seg.speaker, stats);
    });

    const totalDuration = Array.from(speakerStats.values()).reduce(
      (acc, s) => acc + s.totalDuration,
      0
    );

    return { speakerStats, totalDuration };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDecimal = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const { speakerStats, totalDuration } = calculateStatistics();

  const sortedSpeakers = Array.from(speakerStats.entries()).sort(
    (a, b) => b[1].totalDuration - a[1].totalDuration
  );

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
  ];

  return (
    <div className={className}>
      {segments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No diarization results to analyze. Upload a file and run diarization to see statistics.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedSpeakers.map(([speakerId, stats], index) => {
              const colorClass = colors[index % colors.length];
              const percentage =
                totalDuration > 0 ? (stats.totalDuration / totalDuration) * 100 : 0;
              const avgDuration =
                stats.segmentCount > 0 ? stats.totalDuration / stats.segmentCount : 0;

              return (
                <div key={speakerId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                    <h3 className="font-medium">{getSpeakerName(speakerId)}</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Speaking Time:</span>
                      <span className="font-medium">{formatTime(stats.totalDuration)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Number of Turns:</span>
                      <span className="font-medium">{stats.segmentCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average Turn Duration:</span>
                      <span className="font-medium">{formatTime(avgDuration)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Percentage of Total:</span>
                      <span className="font-medium">{formatDecimal(percentage)}%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Speaking Time</span>
                      <span>{formatDecimal(percentage)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colorClass} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-medium">Summary Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Total Speakers</span>
                <span className="font-medium text-lg">{speakerStats.size}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Total Segments</span>
                <span className="font-medium text-lg">{segments.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Total Duration</span>
                <span className="font-medium text-lg">{formatTime(totalDuration)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Avg Turn Duration</span>
                <span className="font-medium text-lg">
                  {formatTime(totalDuration / segments.length)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
