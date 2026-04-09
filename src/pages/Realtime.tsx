import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import { realtimeService } from '@/services/realtime';
import { PageHeader } from '@/components/layout/PageHeader';
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
import { Badge } from '@/components/ui/badge';
import { Play, Square, Mic, Volume2, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export default function Realtime() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const [selectedModel, setSelectedModel] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionId, setConnectionId] = useState('');
  const [receivedAudioData, setReceivedAudioData] = useState<ArrayBuffer | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const { data: models = [] } = useQuery({
    queryKey: ['models', 'realtime', currentWorkspaceId],
    queryFn: () => modelsService.getLocalModels(),
  });

  const realtimeModels = models.filter((m) => m.id.includes('realtime') || m.id.includes('stream'));

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      realtimeService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (realtimeModels.length > 0 && !selectedModel) {
      setSelectedModel(realtimeModels[0].id);
    }
  }, [realtimeModels, selectedModel]);

  const updateAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average / 255);
    }
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const handleConnect = async () => {
    try {
      const id = await realtimeService.establishConnection({
        model: selectedModel,
        audioFormat: 'mp3',
        sampleRate: 24000,
      });
      setConnectionId(id);
      setIsConnected(true);

      realtimeService.onAudioData((data) => {
        setReceivedAudioData(data);
        playAudio(data);
      });

      toast({
        title: 'Connected',
        description: `Realtime connection established (ID: ${id})`,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = () => {
    realtimeService.disconnect();
    setIsConnected(false);
    setConnectionId('');
    setAudioLevel(0);
    toast({
      title: 'Disconnected',
      description: 'Realtime connection closed',
    });
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && isConnected) {
          const arrayBuffer = await event.data.arrayBuffer();
          realtimeService.sendAudio(arrayBuffer);
        }
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      updateAudioLevel();

      toast({
        title: 'Recording Started',
        description: 'Audio is being streamed to the server',
      });
    } catch (error) {
      toast({
        title: 'Recording Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsRecording(false);
    setAudioLevel(0);
  };

  const playAudio = async (audioData: ArrayBuffer) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 pl-2 space-y-6">
      <PageHeader title="Realtime WebRTC" description="Real-time audio streaming with AI models" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Connection Status</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isConnected ? 'Connected to realtime server' : 'Not connected'}
                  </p>
                </div>
                <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-2">
                  {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>

              {isConnected && connectionId && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Connection ID</p>
                  <p className="font-mono text-sm">{connectionId}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {!isConnected ? (
                  <Button onClick={handleConnect} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                ) : (
                  <Button onClick={handleDisconnect} variant="destructive" className="w-full">
                    <Square className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                )}

                <Button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={!isConnected}
                  variant={isRecording ? 'destructive' : 'default'}
                  className="w-full"
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Input Audio Level</span>
                  <span className="font-medium">{(audioLevel * 100).toFixed(0)}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
              </div>

              {isConnected && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Audio Streaming Active
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Your microphone is being streamed in real-time. The AI will respond with
                        audio output.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium mb-4">Audio Visualization</h3>
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                {isRecording ? (
                  <div className="flex items-end gap-1 h-20">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-primary rounded-t transition-all"
                        style={{
                          height: `${20 + Math.random() * 80}%`,
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Start recording to see audio visualization
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Model</Label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={isConnected}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {realtimeModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Audio Format</Label>
                <Select defaultValue="mp3" disabled={isConnected}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                    <SelectItem value="flac">FLAC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sample Rate</Label>
                <Select defaultValue="24000" disabled={isConnected}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16000">16000 Hz</SelectItem>
                    <SelectItem value="24000">24000 Hz</SelectItem>
                    <SelectItem value="48000">48000 Hz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium mb-4">Connection Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                    {isConnected ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recording:</span>
                  <span className={isRecording ? 'text-green-600' : 'text-muted-foreground'}>
                    {isRecording ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocol:</span>
                  <span>WebSocket</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latency:</span>
                  <span>~50ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
