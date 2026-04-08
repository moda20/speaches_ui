import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, RotateCcw, Loader2 } from 'lucide-react';
import { AudioPlayer } from '@/components/features/audio/AudioPlayer';

interface AudioRecorderProps {
  isRecording: boolean;
  audioUrl: string | null;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => void;
  onResetRecording: () => void;
  error: string | null;
  disabled?: boolean;
  recordingDuration?: number;
}

export function AudioRecorder({
  isRecording,
  audioUrl,
  onStartRecording,
  onStopRecording,
  onResetRecording,
  error,
  disabled = false,
  recordingDuration = 0,
}: AudioRecorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isRecording && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bars = 20;
        const barWidth = canvas.width / bars;

        for (let i = 0; i < bars; i++) {
          const height = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
          const x = i * barWidth;
          const y = (canvas.height - height) / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + height);
          gradient.addColorStop(0, 'rgb(59, 130, 246)');
          gradient.addColorStop(1, 'rgb(147, 51, 234)');

          ctx.fillStyle = gradient;
          ctx.fillRect(x + 2, y, barWidth - 4, height);
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Audio Input</h3>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              Recording
            </Badge>
          )}
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>
        )}

        {isRecording && (
          <div className="space-y-2">
            <canvas
              ref={canvasRef}
              width={200}
              height={60}
              className="w-full h-16 rounded-lg bg-muted"
            />
            <div className="text-center">
              <span className="text-2xl font-mono">{formatDuration(recordingDuration)}</span>
            </div>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="space-y-2">
            <AudioPlayer src={audioUrl} title="Recorded audio" />
          </div>
        )}

        <div className="flex gap-2">
          {!isRecording && !audioUrl && (
            <Button onClick={onStartRecording} disabled={disabled} className="flex-1">
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button variant="destructive" onClick={onStopRecording} className="flex-1">
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          )}

          {audioUrl && !isRecording && (
            <>
              <Button onClick={onResetRecording} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Re-record
              </Button>
              <Button onClick={onResetRecording} variant="outline" size="icon">
                <Loader2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          {isRecording
            ? 'Speak clearly into your microphone'
            : audioUrl
              ? 'Review your recording or re-record'
              : 'Click to start recording your message'}
        </div>
      </CardContent>
    </Card>
  );
}
