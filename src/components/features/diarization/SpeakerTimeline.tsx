import { DiarizationSegment } from '@/services/diarization';

interface SpeakerTimelineProps {
  segments: DiarizationSegment[];
  speakerNames?: Map<string, string>;
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onSegmentClick?: (segment: DiarizationSegment, index: number) => void;
  highlightedSpeaker?: string;
  className?: string;
}

const SPEAKER_COLORS: Record<string, string> = {
  SPEAKER_00: 'rgb(59, 130, 246)', // blue-500
  SPEAKER_01: 'rgb(34, 197, 94)', // green-500
  SPEAKER_02: 'rgb(168, 85, 247)', // purple-500
  SPEAKER_03: 'rgb(249, 115, 22)', // orange-500
  SPEAKER_04: 'rgb(236, 72, 153)', // pink-500
};

export function SpeakerTimeline({
  segments,
  speakerNames,
  duration,
  currentTime,
  onSeek,
  onSegmentClick,
  highlightedSpeaker,
  className,
}: SpeakerTimelineProps) {
  const getSpeakerName = (speakerId: string) => {
    return speakerNames?.get(speakerId) || speakerId;
  };

  const getSpeakerColor = (speakerId: string) => {
    return SPEAKER_COLORS[speakerId] || 'rgb(107, 114, 128)';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(percentage * duration);
  };

  const uniqueSpeakers = Array.from(new Set(segments.map((s) => s.speaker)));

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {uniqueSpeakers.map((speakerId) => (
            <div key={speakerId} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSpeakerColor(speakerId) }}
              />
              <span className="text-sm">{getSpeakerName(speakerId)}</span>
            </div>
          ))}
        </div>

        <div
          className="relative h-16 bg-muted rounded-lg cursor-pointer overflow-hidden"
          onClick={handleClick}
        >
          {segments.map((segment, index) => {
            const startPercent = (segment.start / duration) * 100;
            const widthPercent = ((segment.end - segment.start) / duration) * 100;
            const isHighlighted = highlightedSpeaker === segment.speaker;

            return (
              <div
                key={index}
                className={`absolute top-0 bottom-0 transition-opacity cursor-pointer ${
                  isHighlighted ? 'opacity-100' : 'opacity-70'
                } hover:opacity-100`}
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  backgroundColor: getSpeakerColor(segment.speaker),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSegmentClick?.(segment, index);
                }}
                title={`${getSpeakerName(segment.speaker)}: ${formatTime(segment.start)} - ${formatTime(segment.end)}`}
              />
            );
          })}

          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 pointer-events-none z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
