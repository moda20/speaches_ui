import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import { transcriptionService } from '@/services/transcription';
import type { components } from '@/types/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileUpload } from '@/components/features/upload/FileUpload';
import { AudioPlayer } from '@/components/features/audio/AudioPlayer';
import { toast } from '@/hooks/use-toast';
import {
  Mic,
  FileText,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

type Model = components['schemas']['Model'];

const RESPONSE_FORMATS = [
  { value: 'text', label: 'Plain Text' },
  { value: 'json', label: 'JSON' },
  { value: 'verbose_json', label: 'Verbose JSON' },
  { value: 'srt', label: 'SRT (Subtitles)' },
  { value: 'vtt', label: 'VTT (WebVTT)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ar', label: 'Arabic' },
];

type TranscriptionHistoryItem = {
  id: string;
  fileName: string;
  timestamp: number;
  result: string;
  segments?: any[];
  language?: string;
  model?: string;
};

export default function Transcription() {
  const [mode, setMode] = useState<'transcribe' | 'translate'>('transcribe');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('whisper-1');
  const [language, setLanguage] = useState<string>('en');
  const [responseFormat, setResponseFormat] = useState<string>('text');
  const [timestampGranularities, setTimestampGranularities] = useState<string[]>(['segment']);
  const [temperature, setTemperature] = useState<number>(0);
  const [prompt, setPrompt] = useState<string>('');
  const [transcriptionResult, setTranscriptionResult] = useState<string>('');
  const [transcriptionSegments, setTranscriptionSegments] = useState<any[]>([]);
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionHistoryItem[]>(
    () => {
      const saved = localStorage.getItem('transcriptionHistory');
      return saved ? JSON.parse(saved) : [];
    }
  );

  const uploadProgress = useState(0)[0];

  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['models', 'asr'],
    queryFn: () => modelsService.getLocalModels('automatic-speech-recognition'),
  });

  const transcriptionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');

      const options = {
        model: selectedModel,
        language: mode === 'transcribe' ? language : undefined,
        response_format: responseFormat as any,
        timestamp_granularities: timestampGranularities as any[],
        temperature,
        prompt: prompt || undefined,
      };

      const result = await transcriptionService.transcribeFile(selectedFile, options);
      return result;
    },
    onSuccess: (result) => {
      setTranscriptionResult(result.text);
      setTranscriptionSegments(result.segments || []);

      if (selectedFile) {
        const historyItem: TranscriptionHistoryItem = {
          id: Date.now().toString(),
          fileName: selectedFile.name,
          timestamp: Date.now(),
          result: result.text,
          segments: result.segments,
          language,
          model: selectedModel,
        };
        const newHistory = [historyItem, ...transcriptionHistory].slice(0, 50);
        setTranscriptionHistory(newHistory);
        localStorage.setItem('transcriptionHistory', JSON.stringify(newHistory));
      }

      toast({
        title: mode === 'transcribe' ? 'Transcription complete' : 'Translation complete',
        description: 'Your audio has been processed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Processing failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setTranscriptionResult('');
    setTranscriptionSegments([]);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }
    setTranscriptionResult('');
    setTranscriptionSegments([]);
  };

  const handleTranscribe = () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an audio file first.',
        variant: 'destructive',
      });
      return;
    }
    transcriptionMutation.mutate();
  };

  const handleDownloadResult = () => {
    if (!transcriptionResult) return;

    let content = transcriptionResult;
    let filename = `transcription_${Date.now()}`;
    let mimeType = 'text/plain';

    if (responseFormat === 'json' || responseFormat === 'verbose_json') {
      const data = transcriptionSegments.length
        ? { text: transcriptionResult, segments: transcriptionSegments }
        : { text: transcriptionResult };
      content = JSON.stringify(data, null, 2);
      filename += '.json';
      mimeType = 'application/json';
    } else if (responseFormat === 'srt') {
      content = generateSRT(transcriptionSegments, transcriptionResult);
      filename += '.srt';
    } else if (responseFormat === 'vtt') {
      content = generateVTT(transcriptionSegments, transcriptionResult);
      filename += '.vtt';
    } else {
      filename += '.txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'Transcription has been downloaded.',
    });
  };

  const handleClearHistory = () => {
    setTranscriptionHistory([]);
    localStorage.removeItem('transcriptionHistory');
    toast({
      title: 'History cleared',
      description: 'Transcription history has been cleared.',
    });
  };

  const handleLoadFromHistory = (item: TranscriptionHistoryItem) => {
    setTranscriptionResult(item.result);
    setTranscriptionSegments(item.segments || []);
    if (item.language) setLanguage(item.language);
    if (item.model) setSelectedModel(item.model);
  };

  const generateSRT = (segments: any[], text: string) => {
    if (segments.length === 0) return text;

    return segments
      .map((seg, i) => {
        const start = formatTimestamp(seg.start);
        const end = formatTimestamp(seg.end);
        return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
      })
      .join('\n');
  };

  const generateVTT = (segments: any[], text: string) => {
    if (segments.length === 0) return `WEBVTT\n\n${text}`;

    let vtt = 'WEBVTT\n\n';
    vtt += segments
      .map((seg, i) => {
        const start = formatTimestampVTT(seg.start);
        const end = formatTimestampVTT(seg.end);
        return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
      })
      .join('\n');
    return vtt;
  };

  const formatTimestamp = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  const formatTimestampVTT = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const asrModels = models.filter((m) => m.task === 'automatic-speech-recognition');

  return (
    <div className="p-4 pl-2 space-y-6">
      <PageHeader
        title="Transcription"
        description="Transcribe audio files to text with AI-powered speech recognition"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMode(mode === 'transcribe' ? 'translate' : 'transcribe')}
            >
              {mode === 'transcribe' ? (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Transcribe
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Translate
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Upload Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={selectedFile || undefined}
                uploadProgress={uploadProgress}
                isUploading={transcriptionMutation.isPending}
              />

              {audioUrl && selectedFile && (
                <AudioPlayer
                  src={audioUrl}
                  title={selectedFile.name as string}
                  onDownload={() => {
                    const a = document.createElement('a');
                    a.href = audioUrl;
                    a.download = selectedFile.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                {isLoadingModels ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    disabled={!selectedFile}
                  >
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {asrModels.length > 0 ? (
                        asrModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.id}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="whisper-1">whisper-1 (default)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {mode === 'transcribe' && (
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage} disabled={!selectedFile}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="format">Response Format</Label>
                <Select
                  value={responseFormat}
                  onValueChange={setResponseFormat}
                  disabled={!selectedFile}
                >
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSE_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Timestamp Granularity</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={timestampGranularities.includes('segment')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTimestampGranularities([...timestampGranularities, 'segment']);
                        } else {
                          setTimestampGranularities(
                            timestampGranularities.filter((t) => t !== 'segment')
                          );
                        }
                      }}
                      disabled={!selectedFile || responseFormat === 'text'}
                    />
                    <span className="text-sm">Segment</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={timestampGranularities.includes('word')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTimestampGranularities([...timestampGranularities, 'word']);
                        } else {
                          setTimestampGranularities(
                            timestampGranularities.filter((t) => t !== 'word')
                          );
                        }
                      }}
                      disabled={!selectedFile || responseFormat === 'text'}
                    />
                    <span className="text-sm">Word</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="temperature">Temperature: {temperature}</Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                  disabled={!selectedFile}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt">Prompt (optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Optional text to guide the transcription..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={!selectedFile}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleTranscribe}
                disabled={!selectedFile || transcriptionMutation.isPending}
              >
                {transcriptionMutation.isPending ? (
                  'Processing...'
                ) : mode === 'transcribe' ? (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Transcribe
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Translate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {transcriptionHistory.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>History</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transcriptionHistory.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleLoadFromHistory(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {item.language?.toUpperCase() || 'EN'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Results</CardTitle>
              {transcriptionResult && (
                <Button variant="outline" size="sm" onClick={handleDownloadResult}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {transcriptionMutation.isPending ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : transcriptionResult ? (
              <div className="space-y-4">
                <Textarea
                  value={transcriptionResult}
                  onChange={(e) => setTranscriptionResult(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />

                {transcriptionSegments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">
                      Segments ({transcriptionSegments.length})
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {transcriptionSegments.map((seg, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {formatTimestamp(seg.start)} - {formatTimestamp(seg.end)}
                            </Badge>
                          </div>
                          <p className="text-sm">{seg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transcription yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload an audio file and click transcribe to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
