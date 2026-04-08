import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import {
  diarizationService,
  type DiarizationResult,
  type DiarizationSegment,
} from '@/services/diarization';
import { PageHeader } from '@/components/layout/PageHeader';
import { FileUpload } from '@/components/features/upload/FileUpload';
import { AudioPlayer } from '@/components/features/audio/AudioPlayer';
import { SpeakerTimeline } from '@/components/features/diarization/SpeakerTimeline';
import { SpeakerSegmentList } from '@/components/features/diarization/SpeakerSegmentList';
import { SpeakerStatistics } from '@/components/features/diarization/SpeakerStatistics';
import { SpeakerNameEditor } from '@/components/features/diarization/SpeakerNameEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Diarization() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [responseFormat, setResponseFormat] = useState<'json' | 'rttm'>('json');
  const [knownSpeakerNames, setKnownSpeakerNames] = useState<string[]>([]);
  const [speakerNamesMap, setSpeakerNamesMap] = useState<Map<string, string>>(new Map());
  const [diarizationResults, setDiarizationResults] = useState<DiarizationResult | null>(null);
  const [highlightedSpeaker, setHighlightedSpeaker] = useState<string>('');
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  const [currentTime, setCurrentTime] = useState(0);

  const { data: models = [] } = useQuery({
    queryKey: ['models', 'diarization'],
    queryFn: () => modelsService.getLocalModels(),
  });

  const diarizationModels = models.filter(
    (m) => m.id.includes('diariz') || m.id.includes('speaker')
  );

  useEffect(() => {
    if (diarizationModels.length > 0 && !selectedModel) {
      setSelectedModel(diarizationModels[0].id);
    }
  }, [diarizationModels, selectedModel]);

  const diarizationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');
      return await diarizationService.diarizeAudio(selectedFile, {
        known_speaker_names: knownSpeakerNames.length > 0 ? knownSpeakerNames : undefined,
        response_format: responseFormat,
      });
    },
    onSuccess: (result) => {
      setDiarizationResults(result);

      // Initialize speaker names map with default names
      const uniqueSpeakers = Array.from(new Set(result.segments.map((s) => s.speaker)));
      const newMap = new Map<string, string>();
      uniqueSpeakers.forEach((speakerId, index) => {
        const existingName = speakerNamesMap.get(speakerId);
        newMap.set(speakerId, existingName || `Speaker ${index + 1}`);
      });
      setSpeakerNamesMap(newMap);

      setHighlightedSpeaker('');
      setSelectedSegments(new Set());
      toast({
        title: 'Diarization Complete',
        description: `Identified ${uniqueSpeakers.length} speakers with ${result.segments.length} segments`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Diarization Failed',
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

  const handleDiarize = () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select an audio file first',
        variant: 'destructive',
      });
      return;
    }
    diarizationMutation.mutate();
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
      setCurrentTime(time);
    }
  };

  const handleSegmentClick = (segment: DiarizationSegment, index: number) => {
    setHighlightedSpeaker(segment.speaker);
    handleSegmentPlay(segment.start, segment.end);
  };

  const handleSpeakerNameChange = (speakerId: string, newName: string) => {
    setSpeakerNamesMap((prev) => {
      const next = new Map(prev);
      next.set(speakerId, newName);
      return next;
    });
    toast({
      title: 'Speaker Name Updated',
      description: `Renamed to "${newName}"`,
    });
  };

  const handleMergeSegments = (indices: number[]) => {
    if (!diarizationResults) return;

    const sortedIndices = [...indices].sort((a, b) => a - b);
    const segmentsToMerge = sortedIndices.map((i) => diarizationResults.segments[i]);

    if (segmentsToMerge.length < 2) return;

    const mergedSegment: DiarizationSegment = {
      speaker: segmentsToMerge[0].speaker,
      start: segmentsToMerge[0].start,
      end: segmentsToMerge[segmentsToMerge.length - 1].end,
      confidence: Math.min(...segmentsToMerge.map((s) => s.confidence || 1)),
    };

    const indicesSet = new Set(indices);
    const newSegments = diarizationResults.segments.filter((_, i) => !indicesSet.has(i));
    newSegments.push(mergedSegment);
    newSegments.sort((a, b) => a.start - b.start);

    setDiarizationResults({ ...diarizationResults, segments: newSegments });
    setSelectedSegments(new Set());
    toast({
      title: 'Segments Merged',
      description: `Merged ${indices.length} segments into one`,
    });
  };

  const handleExportJSON = () => {
    if (!diarizationResults) return;

    const data = {
      timestamp: Date.now(),
      audio_file: selectedFile?.name,
      model: selectedModel,
      speaker_names: Array.from(speakerNamesMap.entries()),
      segments: diarizationResults.segments.map((seg) => ({
        ...seg,
        speaker_name: speakerNamesMap.get(seg.speaker) || seg.speaker,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diarization-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSRT = () => {
    if (!diarizationResults) return;

    const srtContent = diarizationResults.segments
      .map((seg, i) => {
        const startTime = formatTime(seg.start).replace('.', ',');
        const endTime = formatTime(seg.end).replace('.', ',');
        const speakerName = speakerNamesMap.get(seg.speaker) || seg.speaker;
        return `${i + 1}\n${startTime} --> ${endTime}\n[${speakerName}]\n`;
      })
      .join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diarization-${Date.now()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportVTT = () => {
    if (!diarizationResults) return;

    const vttContent = `WEBVTT\n\n${diarizationResults.segments
      .map((seg, i) => {
        const startTime = formatTime(seg.start);
        const endTime = formatTime(seg.end);
        const speakerName = speakerNamesMap.get(seg.speaker) || seg.speaker;
        return `${i + 1}\n${startTime} --> ${endTime}\n[${speakerName}]\n`;
      })
      .join('\n')}`;

    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diarization-${Date.now()}.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportRTTM = () => {
    if (!diarizationResults) return;

    const rttmContent = diarizationResults.segments
      .map((seg) => {
        const speakerName = speakerNamesMap.get(seg.speaker) || seg.speaker;
        const duration = seg.end - seg.start;
        return `SPEAKER ${selectedFile?.name || 'audio'} 1 ${formatTime(seg.start).replace('.', '')} ${duration.toFixed(3)} <NA> <NA> ${speakerName} <NA> <NA>`;
      })
      .join('\n');

    const blob = new Blob([rttmContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diarization-${Date.now()}.rttm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const audioUrl = selectedFile ? URL.createObjectURL(selectedFile) : undefined;
  const duration = diarizationResults?.audio_duration || 0;

  return (
    <div className="container mx-auto p-4 pl-2 space-y-6">
      <PageHeader
        title="Speaker Diarization"
        description="Identify and separate different speakers in audio files"
      />

      <audio
        ref={audioRef}
        className="hidden"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <FileUpload
            onFileSelect={setSelectedFile}
            onFileRemove={() => setSelectedFile(null)}
            selectedFile={selectedFile || undefined}
            isUploading={diarizationMutation.isPending}
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

          {diarizationResults && duration > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">Speaker Timeline</h3>
                <SpeakerTimeline
                  segments={diarizationResults.segments}
                  speakerNames={speakerNamesMap}
                  duration={duration}
                  currentTime={currentTime}
                  onSeek={handleTimelineSeek}
                  onSegmentClick={handleSegmentClick}
                  highlightedSpeaker={highlightedSpeaker}
                />
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={handleExportJSON}>
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportSRT}>
                    <Download className="h-4 w-4 mr-2" />
                    SRT
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportVTT}>
                    <Download className="h-4 w-4 mr-2" />
                    VTT
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportRTTM}>
                    <Download className="h-4 w-4 mr-2" />
                    RTTM
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {diarizationResults && (
            <SpeakerSegmentList
              segments={diarizationResults.segments}
              speakerNames={speakerNamesMap}
              audioUrl={audioUrl}
              onSegmentPlay={handleSegmentPlay}
              onSpeakerNameChange={handleSpeakerNameChange}
              onMergeSegments={handleMergeSegments}
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
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {diarizationModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Response Format</Label>
                <Select value={responseFormat} onValueChange={(v: any) => setResponseFormat(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="rttm">RTTM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleDiarize}
                disabled={!selectedFile || diarizationMutation.isPending}
                className="w-full"
              >
                {diarizationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Identify Speakers
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <SpeakerNameEditor speakerNames={knownSpeakerNames} onChange={setKnownSpeakerNames} />

          {diarizationResults && (
            <SpeakerStatistics
              segments={diarizationResults.segments}
              speakerNames={speakerNamesMap}
            />
          )}
        </div>
      </div>
    </div>
  );
}
