import React from 'react';

interface AudioTimelineProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  segments?: Array<{ start: number; end: number; label?: string }>;
  highlightedSegment?: number;
  className?: string;
}

export function AudioTimeline({
  duration,
  currentTime,
  onSeek,
  segments = [],
  highlightedSegment,
  className,
}: AudioTimelineProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(percentage * duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className="relative h-12 bg-muted rounded-lg cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        {segments.map((segment, index) => {
          const startPercent = (segment.start / duration) * 100;
          const widthPercent = ((segment.end - segment.start) / duration) * 100;
          const isHighlighted = index === highlightedSegment;

          return (
            <div
              key={index}
              className={`absolute top-0 bottom-0 ${
                isHighlighted ? 'bg-primary opacity-80' : 'bg-primary/40'
              } transition-opacity`}
              style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
              }}
              title={
                segment.label
                  ? `${segment.label}: ${formatTime(segment.start)} - ${formatTime(segment.end)}`
                  : undefined
              }
            />
          );
        })}
        <div
          className="absolute top-0 bottom-0 w-1 bg-red-500 pointer-events-none"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
