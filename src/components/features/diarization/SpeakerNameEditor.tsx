import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface SpeakerNameEditorProps {
  speakerNames: string[];
  onChange: (names: string[]) => void;
  className?: string;
}

export function SpeakerNameEditor({ speakerNames, onChange, className }: SpeakerNameEditorProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddName = () => {
    if (inputValue.trim() && !speakerNames.includes(inputValue.trim())) {
      onChange([...speakerNames, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveName = (name: string) => {
    onChange(speakerNames.filter((n) => n !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddName();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Known Speaker Names</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter speaker name..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleAddName} disabled={!inputValue.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {speakerNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {speakerNames.map((name, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {name}
                <button
                  onClick={() => handleRemoveName(name)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Add known speaker names to help the diarization model identify speakers. This is optional.
        </p>
      </CardContent>
    </Card>
  );
}
