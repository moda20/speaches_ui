import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save } from 'lucide-react';

export interface ChatSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
  voice: string;
}

interface ChatSettingsProps {
  settings: ChatSettings;
  availableModels: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ChatSettings) => void;
}

export function ChatSettings({
  settings,
  availableModels,
  isOpen,
  onClose,
  onSave,
}: ChatSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const presetPrompts = [
    {
      name: 'Helpful Assistant',
      prompt:
        'You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.',
    },
    {
      name: 'Technical Expert',
      prompt:
        'You are a technical expert. Provide detailed, accurate, and well-structured technical explanations. Use code examples when appropriate.',
    },
    {
      name: 'Creative Writer',
      prompt:
        'You are a creative writer. Use vivid imagery, engaging storytelling, and creative language in your responses.',
    },
    {
      name: 'Tutor',
      prompt:
        'You are a patient tutor. Explain concepts clearly, provide examples, and encourage learning. Check understanding and offer additional help.',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>Configure your AI chat experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>System Prompt</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  const preset = presetPrompts.find((p) => p.name === value);
                  if (preset) {
                    setLocalSettings({ ...localSettings, systemPrompt: preset.prompt });
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Load preset" />
                </SelectTrigger>
                <SelectContent>
                  {presetPrompts.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
              placeholder="Enter a system prompt to guide the AI's behavior..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              The system prompt sets the behavior and personality of the AI assistant.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={localSettings.model}
                onValueChange={(value) => setLocalSettings({ ...localSettings, model: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Voice</Label>
              <Select
                value={localSettings.voice}
                onValueChange={(value) => setLocalSettings({ ...localSettings, voice: value })}
              >
                <SelectTrigger>
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
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Temperature</Label>
                <span className="text-sm text-muted-foreground">
                  {localSettings.temperature.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[localSettings.temperature]}
                onValueChange={([value]) =>
                  setLocalSettings({ ...localSettings, temperature: value })
                }
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={localSettings.maxTokens}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    maxTokens: parseInt(e.target.value) || 2048,
                  })
                }
                min={1}
                max={128000}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of tokens in the AI's response.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
