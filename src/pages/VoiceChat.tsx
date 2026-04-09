import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voiceChatService } from '@/services/voiceChat';
import { modelsService } from '@/services/models';
import { useChatStore } from '@/stores/chatStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import {
  Send,
  Mic,
  Square,
  Settings,
  Plus,
  Trash2,
  Download,
  Loader2,
  Bot,
  MessageSquare,
  Search,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AudioPlayer } from '@/components/features/audio/AudioPlayer';
import { ChatMessage } from '@/components/features/chat/ChatMessage';
import { ChatHistory } from '@/components/features/chat/ChatHistory';

export default function VoiceChat() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [inputText, setInputText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState('');
  const [tempTemperature, setTempTemperature] = useState(0.7);
  const [tempMaxTokens, setTempMaxTokens] = useState(2048);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [enableStreaming, setEnableStreaming] = useState(true);
  const [selectedTranscriptionModel, setSelectedTranscriptionModel] = useState('');
  const [selectedSpeechModel, setSelectedSpeechModel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    messages,
    isRecording,
    isProcessing,
    selectedModel,
    systemPrompt,
    temperature,
    maxTokens,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    setIsRecording,
    setIsProcessing,
    setSelectedModel,
    setSystemPrompt,
    setTemperature,
    setMaxTokens,
  } = useChatStore();

  const {
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    isRecording: isAudioRecording,
  } = useAudioRecorder();

  const { data: models = [] } = useQuery({
    queryKey: ['models', currentWorkspaceId],
    queryFn: () => modelsService.getLocalModels(),
  });

  const chatModels = [
    { id: 'glm-5.1', name: 'GLM-5.1 (Flagship)' },
    { id: 'glm-4.7', name: 'GLM-4.7' },
    { id: 'glm-4v-turbo', name: 'GLM-4V-Turbo (Multimodal)' },
    { id: 'gpt-4o', name: 'GPT-4o (OpenAI)' },
    { id: 'gpt-4o-mini', name: 'GPT-4o-mini (OpenAI)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo (OpenAI)' },
  ];

  const transcriptionModels = models.filter(
    (m) => m.task === 'automatic-speech-recognition' || m.id.includes('whisper')
  );

  const speechModels = models.filter((m) => m.task === 'text-to-speech' || m.id.includes('tts'));

  useEffect(() => {
    if (chatModels.length > 0 && !selectedModel) {
      setSelectedModel(chatModels[0].id);
    }
  }, [chatModels, selectedModel, setSelectedModel]);

  useEffect(() => {
    if (transcriptionModels.length > 0 && !selectedTranscriptionModel) {
      setSelectedTranscriptionModel(transcriptionModels[0].id);
    }
  }, [transcriptionModels, selectedTranscriptionModel]);

  useEffect(() => {
    if (speechModels.length > 0 && !selectedSpeechModel) {
      setSelectedSpeechModel(speechModels[0].id);
    }
  }, [speechModels, selectedSpeechModel]);

  useEffect(() => {
    setTempSystemPrompt(systemPrompt);
    setTempTemperature(temperature);
    setTempMaxTokens(maxTokens);
  }, [systemPrompt, temperature, maxTokens]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsRecording(isAudioRecording);
  }, [isAudioRecording, setIsRecording]);

  const chatMutation = useMutation({
    mutationFn: async ({
      content,
      audioData,
    }: {
      content: string | Array<any>;
      audioData?: string;
    }) => {
      const userMessage = {
        role: 'user' as const,
        content: typeof content === 'string' ? content : '[Audio message]',
        audioUrl: audioData,
      };
      addMessage(userMessage);

      if (enableStreaming) {
        let fullContent = '';

        const response = await voiceChatService.handleCompletions(
          {
            model: selectedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
                .filter((m) => m.role !== 'system')
                .map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
              { role: 'user', content },
            ],
            temperature,
            max_tokens: maxTokens,
            stream: true,
            audio: {
              voice: selectedVoice,
              format: 'pcm16',
            },
            transcription_model: selectedTranscriptionModel || 'whisper-1',
            speech_model: selectedSpeechModel || 'tts-1',
          },
          (chunk) => {
            try {
              const parsed = JSON.parse(chunk);
              if (parsed.choices?.[0]?.delta?.content) {
                fullContent += parsed.choices[0].delta.content;

                const existingAssistant = messages.find(
                  (m) => m.role === 'assistant' && m.timestamp === Date.now()
                );

                if (existingAssistant) {
                  updateMessage(existingAssistant.id, fullContent);
                } else {
                  addMessage({
                    role: 'assistant',
                    content: fullContent,
                  });
                }
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        );

        return response;
      } else {
        const response = await voiceChatService.handleCompletions(
          {
            model: selectedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
                .filter((m) => m.role !== 'system')
                .map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
              { role: 'user', content },
            ],
            temperature,
            max_tokens: maxTokens,
            stream: false,
            audio: {
              voice: selectedVoice,
              format: 'mp3',
            },
            transcription_model: selectedTranscriptionModel || 'whisper-1',
            speech_model: selectedSpeechModel || 'tts-1',
          },
          () => {}
        );

        return response;
      }
    },
    onSuccess: (response) => {
      if (!enableStreaming) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: response.choices[0].message.content || '',
        };
        addMessage(assistantMessage);
      }
      setIsProcessing(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsProcessing(false);
    },
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const blobUrlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  };

  const handleSend = async (audioData?: string | null) => {
    if (!inputText.trim() && !audioData) return;

    let content: string | Array<any>;

    if (audioData) {
      const base64Audio = await blobUrlToBase64(audioData);

      content = [
        {
          type: 'input_audio',
          input_audio: {
            data: base64Audio,
            format: 'mp3',
          },
        },
      ];
    } else {
      content = inputText.trim();
    }

    setInputText('');
    setIsProcessing(true);
    resetRecording();

    try {
      await chatMutation.mutateAsync({ content, audioData: audioData || undefined });
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const handleRecord = async () => {
    if (isAudioRecording) {
      await stopRecording();
      if (audioUrl) {
        handleSend(audioUrl);
      }
    } else {
      await startRecording();
    }
  };

  const handleSaveSettings = () => {
    setSystemPrompt(tempSystemPrompt);
    setTemperature(tempTemperature);
    setMaxTokens(tempMaxTokens);
    setIsSettingsOpen(false);
    toast({
      title: 'Settings saved',
      description: 'Chat settings have been updated.',
    });
  };

  const handleExportChat = () => {
    const content = JSON.stringify(messages, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    clearMessages();
    toast({
      title: 'Chat cleared',
      description: 'All messages have been removed.',
    });
  };

  const handleNewChat = () => {
    clearMessages();
    setIsHistoryOpen(false);
    toast({
      title: 'New chat created',
      description: 'Starting a fresh conversation.',
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    removeMessage(messageId);
    toast({
      title: 'Message deleted',
      description: 'The message has been removed.',
    });
  };

  const handleRegenerateMessage = (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const previousMessages = messages.slice(0, messageIndex);
    clearMessages();
    previousMessages.forEach((m) => addMessage(m));

    const lastUserMessage = [...previousMessages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      setInputText(lastUserMessage.content);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    updateMessage(messageId, newContent);
    toast({
      title: 'Message updated',
      description: 'The message has been edited.',
    });
  };

  const handlePlayAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const filteredMessages = messages.filter((m) =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 pl-2 space-y-6">
      <PageHeader
        title="Voice Chat"
        description="Real-time voice conversations with AI"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportChat}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        }
      />

      <audio ref={audioRef} className="hidden" />

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? 'No messages match your search'
                          : 'Start a conversation by typing or recording a message'}
                      </p>
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        id={message.id}
                        role={message.role}
                        content={message.content}
                        audioUrl={message.audioUrl}
                        timestamp={message.timestamp}
                        isStreaming={
                          isProcessing &&
                          message === messages[messages.length - 1] &&
                          message.role === 'assistant'
                        }
                        onCopy={() => {
                          navigator.clipboard.writeText(message.content);
                          toast({ title: 'Copied to clipboard' });
                        }}
                        onRegenerate={() => handleRegenerateMessage(message.id)}
                        onDelete={() => handleDeleteMessage(message.id)}
                        onEdit={(content) => handleEditMessage(message.id, content)}
                        onPlayAudio={() => message.audioUrl && handlePlayAudio(message.audioUrl)}
                      />
                    ))
                  )}
                  {isProcessing && filteredMessages.length === 0 && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="border-t p-4 space-y-3">
                {audioUrl && isAudioRecording === false && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <AudioPlayer src={audioUrl} title="Recorded audio" />
                    <Button variant="ghost" size="sm" onClick={resetRecording}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant={isAudioRecording ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={handleRecord}
                    disabled={isProcessing}
                  >
                    {isAudioRecording ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Textarea
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isProcessing}
                    className="min-h-[44px] resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={() => handleSend(audioUrl)}
                    disabled={isProcessing || (!inputText.trim() && !audioUrl)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-sm font-medium">Chat Model (LLM)</Label>
                <Input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="e.g., glm-5.1, gpt-4o"
                  list="chat-models"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter any model ID from your configured LLM provider (Z.AI, OpenAI, etc.)
                </p>
                <datalist id="chat-models">
                  {chatModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <Label className="text-sm font-medium">Speech Model (TTS)</Label>
                <Select value={selectedSpeechModel} onValueChange={setSelectedSpeechModel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {speechModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Transcription Model (ASR)</Label>
                <Select
                  value={selectedTranscriptionModel}
                  onValueChange={setSelectedTranscriptionModel}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transcriptionModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alloy">Alloy</SelectItem>
                    <SelectItem value="echo">Echo</SelectItem>
                    <SelectItem value="fable">Fable</SelectItem>
                    <SelectItem value="onyx">Onyx</SelectItem>
                    <SelectItem value="nova">Nova</SelectItem>
                    <SelectItem value="shimmer">Shimmer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Auto-play Audio</Label>
                <Switch checked={autoPlayAudio} onCheckedChange={setAutoPlayAudio} />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Streaming</Label>
                <Switch checked={enableStreaming} onCheckedChange={setEnableStreaming} />
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Statistics</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Temperature</span>
                    <span className="font-medium">{temperature.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" onClick={handleNewChat} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
            <DialogDescription>Configure your chat experience</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>System Prompt</Label>
              <Textarea
                value={tempSystemPrompt}
                onChange={(e) => setTempSystemPrompt(e.target.value)}
                className="mt-1 min-h-[100px]"
                placeholder="Enter a system prompt..."
              />
            </div>
            <div>
              <Label>Temperature: {tempTemperature.toFixed(2)}</Label>
              <Slider
                value={[tempTemperature]}
                onValueChange={([value]) => setTempTemperature(value)}
                min={0}
                max={2}
                step={0.1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={tempMaxTokens}
                onChange={(e) => setTempMaxTokens(parseInt(e.target.value) || 2048)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
            <DialogDescription>Current conversation messages</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {messages.map((message) => (
                <div key={message.id} className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                      {message.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm truncate">{message.content}</p>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No messages in current conversation
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
