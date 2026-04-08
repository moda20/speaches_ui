import React from 'react';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  onDownload?: () => void;
  className?: string;
}

export function AudioPlayer({ src, title, onDownload, className }: AudioPlayerProps) {
  return (
    <Card className={`p-4 ${className}`}>
      {title && <div className="mb-3 text-sm font-medium text-foreground">{title}</div>}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <ReactH5AudioPlayer
            src={src}
            autoPlay={false}
            showJumpControls={true}
            showSkipControls={false}
            customAdditionalControls={[]}
            layout="stacked-reverse"
            className="custom-audio-player"
          />
        </div>
        {onDownload && (
          <Button variant="outline" size="icon" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
