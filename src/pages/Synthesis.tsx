import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import { synthesisService } from '@/services/synthesis';
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
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AudioPlayer } from '@/components/features/audio/AudioPlayer';
import { toast } from '@/hooks/use-toast';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import {
  Volume2,
  Download,
  Trash2,
  PlayCircle,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  X,
} from 'lucide-react';

type Model = components['schemas']['Model'];
type SpeechResponseFormat = components['schemas']['SpeechResponseFormat'];

const RESPONSE_FORMATS: { value: SpeechResponseFormat; label: string }[] = [
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV' },
  { value: 'flac', label: 'FLAC' },
  { value: 'opus', label: 'Opus' },
  { value: 'pcm', label: 'PCM' },
  { value: 'aac', label: 'AAC' },
];

const SAMPLE_RATES = [
  { value: 8000, label: '8000 Hz' },
  { value: 16000, label: '16000 Hz' },
  { value: 22050, label: '22050 Hz' },
  { value: 24000, label: '24000 Hz' },
  { value: 44100, label: '44100 Hz' },
  { value: 48000, label: '48000 Hz' },
];

const SPEED_PRESETS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1.0x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2.0x' },
];

const TEXT_PRESETS = [
  {
    category: 'Greetings',
    texts: [
      'Hello! How can I help you today?',
      'Welcome to our service. We are glad to have you here.',
      'Good morning! I hope you have a wonderful day ahead.',
    ],
  },
  {
    category: 'Weather',
    texts: [
      'The weather today is sunny with a high of 75 degrees Fahrenheit.',
      "Expect rain later this afternoon, so don't forget your umbrella.",
      "It's a beautiful spring day with clear skies and gentle breeze.",
    ],
  },
  {
    category: 'News',
    texts: [
      'Breaking news: Scientists have discovered a new species in the Amazon rainforest.',
      'The stock market reached a new all-time high today amid positive economic indicators.',
      'Local officials announce new community initiatives for the upcoming year.',
    ],
  },
];

type SynthesisHistoryItem = {
  id: string;
  text: string;
  timestamp: number;
  audioUrl: string;
  model?: string;
  voice?: string;
  speed?: number;
  format?: string;
};

export default function Synthesis() {
  const { currentWorkspaceId } = useWorkspaceStore();

  const [inputText, setInputText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('tts-1');
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy');
  const [responseFormat, setResponseFormat] = useState<SpeechResponseFormat>('mp3');
  const [speed, setSpeed] = useState<number>(1.0);
  const [sampleRate, setSampleRate] = useState<number>(24000);
  const [stream, setStream] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [synthesisHistory, setSynthesisHistory] = useState<SynthesisHistoryItem[]>(() => {
    const saved = localStorage.getItem('synthesisHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPresets, setShowPresets] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['models', 'tts', currentWorkspaceId],
    queryFn: () => modelsService.getLocalModels('text-to-speech'),
  });

  const { data: voices = [], isLoading: isLoadingVoices } = useQuery({
    queryKey: ['models', 'voices', currentWorkspaceId],
    queryFn: () => modelsService.getAudioVoices(),
  });

  const synthesisMutation = useMutation({
    mutationFn: async () => {
      if (!inputText.trim()) throw new Error('Please enter some text to synthesize');

      const options = {
        model: selectedModel,
        input: inputText,
        voice: selectedVoice,
        response_format: responseFormat,
        speed,
        sample_rate: sampleRate,
        stream,
      };

      const blob = await synthesisService.synthesizeSpeech(options);
      return blob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioBlob(blob);

      const historyItem: SynthesisHistoryItem = {
        id: Date.now().toString(),
        text: inputText,
        timestamp: Date.now(),
        audioUrl: url,
        model: selectedModel,
        voice: selectedVoice,
        speed,
        format: responseFormat,
      };

      const newHistory = [historyItem, ...synthesisHistory].slice(0, 50);
      setSynthesisHistory(newHistory);
      localStorage.setItem('synthesisHistory', JSON.stringify(newHistory));

      toast({
        title: 'Speech synthesized',
        description: 'Your text has been converted to speech successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Synthesis failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerate = () => {
    if (!inputText.trim()) {
      toast({
        title: 'No text entered',
        description: 'Please enter some text to synthesize.',
        variant: 'destructive',
      });
      return;
    }
    synthesisMutation.mutate();
  };

  const handleDownload = () => {
    if (!audioBlob) return;

    const extension = responseFormat;
    const filename = `speech_${Date.now()}.${extension}`;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'Speech has been downloaded.',
    });
  };

  const handleClearHistory = () => {
    synthesisHistory.forEach((item) => {
      URL.revokeObjectURL(item.audioUrl);
    });
    setSynthesisHistory([]);
    localStorage.removeItem('synthesisHistory');
    toast({
      title: 'History cleared',
      description: 'Synthesis history has been cleared.',
    });
  };

  const handleLoadFromHistory = (item: SynthesisHistoryItem) => {
    setInputText(item.text);
    setAudioUrl(item.audioUrl);
    if (item.model) setSelectedModel(item.model);
    if (item.voice) setSelectedVoice(item.voice);
    if (item.speed) setSpeed(item.speed);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(inputText);
    toast({
      title: 'Copied to clipboard',
      description: 'Text has been copied.',
    });
  };

  const handleClearText = () => {
    setInputText('');
    setAudioUrl('');
    setAudioBlob(null);
  };

  const handleInsertPreset = (text: string) => {
    setInputText(text);
    setShowPresets(false);
  };

  const textLength = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const ttsModels = models.filter((m) => m.task === 'text-to-speech');

  return (
    <div className="p-4 pl-2 space-y-6">
      <PageHeader
        title="Speech Synthesis"
        description="Convert text to natural-sounding speech with AI-powered text-to-speech"
        actions={
          <Button variant="outline" onClick={handleGenerate} disabled={!inputText.trim()}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Text Input
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowPresets(!showPresets)}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Presets
                  </Button>
                  {inputText && (
                    <Button variant="ghost" size="sm" onClick={handleCopyText}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  {inputText && (
                    <Button variant="ghost" size="sm" onClick={handleClearText}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showPresets && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  {TEXT_PRESETS.map((preset) => (
                    <div key={preset.category}>
                      <h4 className="font-medium text-sm mb-2">{preset.category}</h4>
                      <div className="space-y-2">
                        {preset.texts.map((text, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="w-full text-left justify-start"
                            onClick={() => handleInsertPreset(text)}
                          >
                            <span className="truncate">{text}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to synthesize... Try one of the presets above or type your own text."
                rows={8}
                className="resize-none"
              />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{textLength} characters</span>
                <span>{wordCount} words</span>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min((textLength / 4000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Max: 4000 characters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                {isLoadingModels ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ttsModels.length > 0 ? (
                        ttsModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.id}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="tts-1">tts-1 (default)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="voice">Voice</Label>
                {isLoadingVoices ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger id="voice">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.length > 0 ? (
                        voices.map((voice) => (
                          <SelectItem key={voice} value={voice}>
                            {voice}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="alloy">Alloy</SelectItem>
                          <SelectItem value="echo">Echo</SelectItem>
                          <SelectItem value="fable">Fable</SelectItem>
                          <SelectItem value="onyx">Onyx</SelectItem>
                          <SelectItem value="nova">Nova</SelectItem>
                          <SelectItem value="shimmer">Shimmer</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="format">Format</Label>
                <Select
                  value={responseFormat}
                  onValueChange={(v) => setResponseFormat(v as SpeechResponseFormat)}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="speed">Speed: {speed}x</Label>
                  <div className="flex gap-1">
                    {SPEED_PRESETS.map((preset) => (
                      <Button
                        key={preset.value}
                        variant={speed === preset.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSpeed(preset.value)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Slider
                  id="speed"
                  min={0.25}
                  max={4.0}
                  step={0.25}
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="samplerate">Sample Rate</Label>
                <Select
                  value={sampleRate.toString()}
                  onValueChange={(v) => setSampleRate(Number(v))}
                >
                  <SelectTrigger id="samplerate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_RATES.map((rate) => (
                      <SelectItem key={rate.value} value={rate.value.toString()}>
                        {rate.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="stream">Stream Output</Label>
                <input
                  id="stream"
                  type="checkbox"
                  checked={stream}
                  onChange={(e) => setStream(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </CardContent>
          </Card>

          {synthesisHistory.length > 0 && (
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
                  {synthesisHistory.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleLoadFromHistory(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {item.format?.toUpperCase()}
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
              <CardTitle>Audio Output</CardTitle>
              {audioUrl && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {synthesisMutation.isPending ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : audioUrl ? (
              <AudioPlayer
                src={audioUrl}
                title={`Generated Speech (${responseFormat.toUpperCase()})`}
                onDownload={handleDownload}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Volume2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No audio generated yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter text and click Generate to create speech
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
