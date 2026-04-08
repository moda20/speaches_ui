import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Bot, MoreVertical, Copy, RotateCcw, Trash2, Volume2, Pencil } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AudioPlayer } from '@/components/features/audio/AudioPlayer';

export interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audioUrl?: string;
  timestamp: number;
  isStreaming?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onEdit?: (content: string) => void;
  onPlayAudio?: () => void;
}

export function ChatMessage({
  id,
  role,
  content,
  audioUrl,
  timestamp,
  isStreaming = false,
  onCopy,
  onRegenerate,
  onDelete,
  onEdit,
  onPlayAudio,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied to clipboard',
      description: 'Message has been copied.',
    });
    onCopy?.();
  };

  const handleSaveEdit = () => {
    onEdit?.(editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  const isSystem = role === 'system';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {!isUser && (
        <div
          className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${isSystem ? 'bg-secondary' : 'bg-primary'}`}
        >
          {isSystem ? (
            <Bot className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4 text-primary-foreground" />
          )}
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[70%]">
        <div
          className={`rounded-lg p-3 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : isSystem
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted'
          }`}
        >
          {isSystem && (
            <Badge variant="outline" className="mb-2 text-xs">
              System
            </Badge>
          )}

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[60px] p-2 rounded bg-background text-foreground text-sm resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm prose dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                {isStreaming && <span className="animate-pulse">▊</span>}
              </div>
              {audioUrl && (
                <div className="mt-2">
                  <AudioPlayer src={audioUrl} title="Voice message" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <span>{formatTime(timestamp)}</span>
          {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <span>•</span>
              {isAssistant && onRegenerate && (
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={onRegenerate}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
              {isUser && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleCopy}>
                <Copy className="h-3 w-3" />
              </Button>
              {audioUrl && onPlayAudio && (
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={onPlayAudio}>
                  <Volume2 className="h-3 w-3" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  {isAssistant && onRegenerate && (
                    <DropdownMenuItem onClick={onRegenerate}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Regenerate
                    </DropdownMenuItem>
                  )}
                  {isUser && onEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
