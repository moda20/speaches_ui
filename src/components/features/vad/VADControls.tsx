import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VADControlsProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: string[];
  threshold: number;
  onThresholdChange: (value: number) => void;
  negThreshold?: number;
  onNegThresholdChange?: (value: number) => void;
  minSpeechDuration: number;
  onMinSpeechDurationChange: (value: number) => void;
  maxSpeechDuration?: number;
  onMaxSpeechDurationChange?: (value: number) => void;
  minSilenceDuration: number;
  onMinSilenceDurationChange: (value: number) => void;
  speechPadding: number;
  onSpeechPaddingChange: (value: number) => void;
  onReset: () => void;
}

export function VADControls({
  selectedModel,
  onModelChange,
  models,
  threshold,
  onThresholdChange,
  negThreshold,
  onNegThresholdChange,
  minSpeechDuration,
  onMinSpeechDurationChange,
  maxSpeechDuration,
  onMaxSpeechDurationChange,
  minSilenceDuration,
  onMinSilenceDurationChange,
  speechPadding,
  onSpeechPaddingChange,
  onReset,
}: VADControlsProps) {
  const handlePresetClick = (type: 'strict' | 'medium' | 'lenient') => {
    const presets = {
      strict: { threshold: 0.85, minSilenceDuration: 1500, speechPadding: 100 },
      medium: { threshold: 0.75, minSilenceDuration: 1000, speechPadding: 0 },
      lenient: { threshold: 0.5, minSilenceDuration: 500, speechPadding: 0 },
    };
    const preset = presets[type];
    onThresholdChange(preset.threshold);
    onMinSilenceDurationChange(preset.minSilenceDuration);
    onSpeechPaddingChange(preset.speechPadding);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>VAD Settings</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset to defaults</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Model</Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Speech Threshold</Label>
            <span className="text-xs text-muted-foreground">{threshold.toFixed(2)}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Slider
                    value={[threshold]}
                    onValueChange={([value]) => onThresholdChange(value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="cursor-pointer"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>Recommended: 0.75 (Higher = stricter detection)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {negThreshold !== undefined && onNegThresholdChange && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Negative Threshold (Optional)</Label>
              <span className="text-xs text-muted-foreground">{negThreshold.toFixed(2)}</span>
            </div>
            <Slider
              value={[negThreshold]}
              onValueChange={([value]) => onNegThresholdChange(value)}
              min={-1}
              max={0}
              step={0.05}
              className="cursor-pointer"
            />
          </div>
        )}

        <div>
          <Label className="text-sm font-medium">Min Speech Duration (ms)</Label>
          <Input
            type="number"
            value={minSpeechDuration}
            onChange={(e) => onMinSpeechDurationChange(Number(e.target.value) || 0)}
            className="mt-1"
            min={0}
            step={50}
          />
        </div>

        {maxSpeechDuration !== undefined && onMaxSpeechDurationChange && (
          <div>
            <Label className="text-sm font-medium">Max Speech Duration (seconds)</Label>
            <Input
              type="number"
              value={maxSpeechDuration}
              onChange={(e) => onMaxSpeechDurationChange(Number(e.target.value) || 0)}
              className="mt-1"
              min={0}
              step={1}
            />
          </div>
        )}

        <div>
          <Label className="text-sm font-medium">Min Silence Duration (ms)</Label>
          <Input
            type="number"
            value={minSilenceDuration}
            onChange={(e) => onMinSilenceDurationChange(Number(e.target.value) || 0)}
            className="mt-1"
            min={0}
            step={100}
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Speech Padding (ms)</Label>
          <Input
            type="number"
            value={speechPadding}
            onChange={(e) => onSpeechPaddingChange(Number(e.target.value) || 0)}
            className="mt-1"
            min={0}
            step={50}
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Presets</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePresetClick('strict')}>
              Strict
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetClick('medium')}>
              Medium
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetClick('lenient')}>
              Lenient
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
