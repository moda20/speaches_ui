import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import { vadService } from '@/services/vad';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/features/upload/FileUpload';
import { AudioPlayer } from '@/components/features/audio/AudioPlayer';
import { AudioTimeline } from '@/components/features/audio/AudioTimeline';
import { VADControls } from '@/components/features/vad/VADControls';
import { SegmentList } from '@/components/features/vad/SegmentList';
import { VADStatistics } from '@/components/features/vad/VADStatistics';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { components } from '@/types/api';
import { useWorkspaceStore } from '@/stores/workspaceStore';

type SpeechTimestamp = components['schemas']['SpeechTimestamp'];

export default function VAD() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState('silero_vad_v5');
  const [threshold, setThreshold] = useState(0.75);
  const [negThreshold, setNegThreshold] = useState<number | undefined>(undefined);
  const [minSpeechDuration, setMinSpeechDuration] = useState(0);
  const [maxSpeechDuration, setMaxSpeechDuration] = useState<number | undefined>(undefined);
  const [minSilenceDuration, setMinSilenceDuration] = useState(1000);
  const [speechPadding, setSpeechPadding] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | undefined>(undefined);
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  const [vadHistory, setVadHistory] = useState<
    Array<{ timestamp: number; segments: SpeechTimestamp[] }>
  >([]);

  const { data: models = [] } = useQuery({
    queryKey: ['models', 'vad', currentWorkspaceId],
    queryFn: () => modelsService.getLocalModels(),
  });

  const vadModels = models.filter(
    (m) => m.task === 'voice-activity-detection' || m.id.includes('vad')
  );

  useEffect(() => {
    if (vadModels.length > 0 && !vadModels.find((m) => m.id === selectedModel)) {
      setSelectedModel(vadModels[0].id);
    }
  }, [vadModels, selectedModel]);

  const vadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');
      return await vadService.detectSpeechTimestamps(selectedFile, {
        model: selectedModel,
        threshold,
        neg_threshold: negThreshold,
        min_speech_duration_ms: minSpeechDuration,
        max_speech_duration_s: maxSpeechDuration,
        min_silence_duration_ms: minSilenceDuration,
        speech_pad_ms: speechPadding,
      });
    },
    onSuccess: (data) => {
      setVadHistory((prev) => [...prev, { timestamp: Date.now(), segments: data }]);
      setCurrentSegmentIndex(undefined);
      setSelectedSegments(new Set());
      toast({
        title: 'VAD Analysis Complete',
        description: `Detected ${data.length} speech segments`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'VAD Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select an audio file first',
        variant: 'destructive',
      });
      return;
    }
    vadMutation.mutate();
  };

  const handleResetSettings = () => {
    setThreshold(0.75);
    setNegThreshold(undefined);
    setMinSpeechDuration(0);
    setMaxSpeechDuration(undefined);
    setMinSilenceDuration(1000);
    setSpeechPadding(0);
  };

  const handleSegmentPlay = (startTime: number, endTime: number) => {
    if (audioRef.current && selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      audioRef.current.src = url;
      audioRef.current.currentTime = startTime;
      audioRef.current.play();

      const stopAt = () => {
        if (audioRef.current && audioRef.current.currentTime >= endTime) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('timeupdate', stopAt);
        }
      };
      audioRef.current.addEventListener('timeupdate', stopAt);
    }
  };

  const handleTimelineSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleExportResults = () => {
    const latestResult = vadHistory[vadHistory.length - 1];
    if (!latestResult) return;

    const content = JSON.stringify(latestResult.segments, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vad-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSRT = () => {
    const latestResult = vadHistory[vadHistory.length - 1];
    if (!latestResult) return;

    const srtContent = latestResult.segments
      .map((seg, i) => {
        const startTime = formatTime(seg.start).replace('.', ',');
        const endTime = formatTime(seg.end).replace('.', ',');
        return `${i + 1}\n${startTime} --> ${endTime}\nSpeech segment\n`;
      })
      .join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vad-results-${Date.now()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportVTT = () => {
    const latestResult = vadHistory[vadHistory.length - 1];
    if (!latestResult) return;

    const vttContent = `WEBVTT\n\n${latestResult.segments
      .map((seg, i) => {
        const startTime = formatTime(seg.start);
        const endTime = formatTime(seg.end);
        return `${i + 1}\n${startTime} --> ${endTime}\nSpeech segment\n`;
      })
      .join('\n')}`;

    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vad-results-${Date.now()}.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportStatistics = () => {
    const latestResult = vadHistory[vadHistory.length - 1];
    if (!latestResult) return;

    const speechDurations = latestResult.segments.map((seg) => seg.end - seg.start);
    const positiveDurations = speechDurations.filter((d) => d > 0);
    const negativeDurations = speechDurations.filter((d) => d < 0);

    const totalSpeechDuration = positiveDurations.reduce((acc, d) => acc + Math.abs(d), 0);
    const totalSilenceDuration = Math.abs(negativeDurations.reduce((acc, d) => acc + d, 0));
    const totalDuration =
      latestResult.segments[latestResult.segments.length - 1].end - latestResult.segments[0].start;
    const speechPercentage = totalDuration > 0 ? (totalSpeechDuration / totalDuration) * 100 : 0;

    const stats = {
      timestamp: latestResult.timestamp,
      totalSpeechDuration,
      totalSilenceDuration,
      speechPercentage,
      numberOfSegments: latestResult.segments.length,
      averageSpeechSegmentDuration:
        positiveDurations.length > 0 ? totalSpeechDuration / positiveDurations.length : 0,
      averageSilenceDuration:
        negativeDurations.length > 0 ? totalSilenceDuration / negativeDurations.length : 0,
      longestSpeechSegment: positiveDurations.length > 0 ? Math.max(...positiveDurations) : 0,
      longestSilenceGap:
        negativeDurations.length > 0 ? Math.max(...negativeDurations.map(Math.abs)) : 0,
    };

    const content = JSON.stringify(stats, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vad-stats-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const latestResult = vadHistory[vadHistory.length - 1];
  const audioUrl = selectedFile ? URL.createObjectURL(selectedFile) : undefined;
  const duration =
    latestResult && latestResult.segments.length > 0
      ? latestResult.segments[latestResult.segments.length - 1].end
      : 0;

  return (
    <div className="container mx-auto p-4 pl-2 space-y-6">
      <PageHeader
        title="Voice Activity Detection"
        description="Detect speech segments in audio files"
      />

      <audio ref={audioRef} className="hidden" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <FileUpload
            onFileSelect={setSelectedFile}
            onFileRemove={() => setSelectedFile(null)}
            selectedFile={selectedFile || undefined}
            isUploading={vadMutation.isPending}
          />

          {selectedFile && audioUrl && (
            <AudioPlayer
              src={audioUrl}
              title={selectedFile.name}
              onDownload={() => {
                if (selectedFile) {
                  const url = URL.createObjectURL(selectedFile);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = selectedFile.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }
              }}
            />
          )}

          {latestResult && duration > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Speech Timeline</h3>
                  <AudioTimeline
                    duration={duration}
                    currentTime={audioRef.current?.currentTime || 0}
                    onSeek={handleTimelineSeek}
                    segments={latestResult.segments}
                    highlightedSegment={currentSegmentIndex}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportSRT}>
                    <Download className="h-4 w-4 mr-2" />
                    Export SRT
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportVTT}>
                    <Download className="h-4 w-4 mr-2" />
                    Export VTT
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {latestResult && (
            <SegmentList
              segments={latestResult.segments}
              audioUrl={audioUrl}
              onSegmentPlay={handleSegmentPlay}
              selectedSegments={selectedSegments}
              onSegmentSelect={(index, selected) => {
                setSelectedSegments((prev) => {
                  const next = new Set(prev);
                  if (selected) {
                    next.add(index);
                  } else {
                    next.delete(index);
                  }
                  return next;
                });
              }}
            />
          )}

          {vadHistory.length > 1 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">History</h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {vadHistory.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                        onClick={() => {
                          setCurrentSegmentIndex(undefined);
                          setSelectedSegments(new Set());
                        }}
                      >
                        <span className="text-sm">
                          {new Date(result.timestamp).toLocaleTimeString()} -{' '}
                          {result.segments.length} segments
                        </span>
                        {index === vadHistory.length - 1 && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <VADControls
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            models={vadModels.map((m) => m.id)}
            threshold={threshold}
            onThresholdChange={setThreshold}
            negThreshold={negThreshold}
            onNegThresholdChange={setNegThreshold}
            minSpeechDuration={minSpeechDuration}
            onMinSpeechDurationChange={setMinSpeechDuration}
            maxSpeechDuration={maxSpeechDuration}
            onMaxSpeechDurationChange={setMaxSpeechDuration}
            minSilenceDuration={minSilenceDuration}
            onMinSilenceDurationChange={setMinSilenceDuration}
            speechPadding={speechPadding}
            onSpeechPaddingChange={setSpeechPadding}
            onReset={handleResetSettings}
          />

          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || vadMutation.isPending}
            className="w-full"
          >
            {vadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Analyze Audio
              </>
            )}
          </Button>

          {latestResult && (
            <VADStatistics segments={latestResult.segments} onExport={handleExportStatistics} />
          )}
        </div>
      </div>
    </div>
  );
}
