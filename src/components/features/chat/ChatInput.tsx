import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Square, Mic, X, Paperclip } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onRecord?: () => void;
  isRecording?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showAttach?: boolean;
  onAttach?: () => void;
  maxLength?: number;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onRecord,
  isRecording = false,
  disabled = false,
  placeholder = 'Type your message...',
  showAttach = false,
  onAttach,
  maxLength = 4000,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        {showAttach && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAttach}
            disabled={disabled}
            className="flex-shrink-0 h-10 w-10"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className="min-h-[44px] max-h-[200px] resize-none pr-12"
            rows={1}
          />
          {value && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChange('')}
              disabled={disabled}
              className="absolute right-2 top-2 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {onRecord && (
          <Button
            variant={isRecording ? 'destructive' : 'outline'}
            size="icon"
            onClick={onRecord}
            disabled={disabled}
            className="flex-shrink-0 h-10 w-10"
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}

        <Button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          size="icon"
          className="flex-shrink-0 h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {maxLength > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>
            {isNearLimit && <span className="text-destructive">Approaching character limit</span>}
          </span>
          <span className={isNearLimit ? 'text-destructive' : ''}>
            {characterCount} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
