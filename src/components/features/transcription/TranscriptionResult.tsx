import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, Edit3, Save, X, FileText, Clock, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { TranscriptionResult } from '@/services/transcription';

interface TranscriptionResultProps {
  result: TranscriptionResult;
  isTranslation?: boolean;
  onEdit?: (text: string) => void;
  fileName?: string;
}

export function TranscriptionResult({
  result,
  isTranslation = false,
  onEdit,
  fileName = 'transcription',
}: TranscriptionResultProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(result.text);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);
  const [showTimestamps, setShowTimestamps] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.text);
    toast({
      title: 'Copied to clipboard',
      description: 'Transcription has been copied to clipboard.',
    });
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedText);
    }
    setIsEditing(false);
    toast({
      title: 'Saved',
      description: 'Transcription has been updated.',
    });
  };

  const handleCancelEdit = () => {
    setEditedText(result.text);
    setIsEditing(false);
  };

  const handleDownload = (format: 'txt' | 'srt' | 'vtt' | 'json') => {
    let content = '';
    let mimeType = 'text/plain';
    let extension = format;

    switch (format) {
      case 'txt':
        content = result.text;
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      case 'json':
        content = JSON.stringify(result, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'srt':
        content = generateSRT(result);
        mimeType = 'text/plain';
        extension = 'srt';
        break;
      case 'vtt':
        content = generateVTT(result);
        mimeType = 'text/plain';
        extension = 'vtt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: `Transcription downloaded as ${extension.toUpperCase()}.`,
    });
  };

  const formatTimestamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const generateSRT = (data: TranscriptionResult): string => {
    if (!data.segments || data.segments.length === 0) {
      return data.text;
    }

    return data.segments
      .map((segment, index) => {
        const start = formatTimestamp(segment.start).replace('.', ',');
        const end = formatTimestamp(segment.end).replace('.', ',');
        return `${index + 1}\n${start} --> ${end}\n${segment.text}\n`;
      })
      .join('\n');
  };

  const generateVTT = (data: TranscriptionResult): string => {
    let vtt = 'WEBVTT\n\n';

    if (!data.segments || data.segments.length === 0) {
      vtt += `00:00:00.000 --> 00:00:10.000\n${data.text}\n`;
    } else {
      data.segments.forEach((segment, index) => {
        const start = formatTimestamp(segment.start);
        const end = formatTimestamp(segment.end);
        vtt += `${index + 1}\n${start} --> ${end}\n${segment.text}\n\n`;
      });
    }

    return vtt;
  };

  const handleSegmentClick = (index: number) => {
    setSelectedSegmentIndex(selectedSegmentIndex === index ? null : index);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isTranslation ? 'Translation' : 'Transcription'} Result
            </CardTitle>
            {fileName && <p className="text-sm text-muted-foreground">{fileName}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Select onValueChange={(value) => handleDownload(value as any)}>
              <SelectTrigger className="w-[120px]">
                <Download className="h-4 w-4 mr-2" />
                Download
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">TXT</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="srt">SRT</SelectItem>
                <SelectItem value="vtt">VTT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          {result.words && result.words.length > 0 && (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Words:</span>
              <span className="font-medium">{result.words.length}</span>
            </div>
          )}
          {result.segments && result.segments.length > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Segments:</span>
              <span className="font-medium">{result.segments.length}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Characters:</span>
            <span className="font-medium">{result.text.length}</span>
          </div>
        </div>

        <Separator />

        {result.segments && result.segments.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="cursor-pointer"
                onClick={() => setShowTimestamps(!showTimestamps)}
              >
                {showTimestamps ? 'Hide' : 'Show'} Timestamps
              </Badge>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {result.segments && result.segments.length > 0 && showTimestamps ? (
              <div className="space-y-2">
                {result.segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    onClick={() => handleSegmentClick(index)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSegmentIndex === index
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}
                      </span>
                      {segment.avg_logprob !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(segment.avg_logprob * 100)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{segment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.text}</p>
              </div>
            )}

            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
