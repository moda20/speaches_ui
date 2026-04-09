import api from '@/lib/api';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export interface RealtimeConnectionOptions {
  model: string;
  audioFormat?: 'mp3' | 'wav' | 'flac' | 'pcm';
  sampleRate?: number;
}

export interface RealtimeService {
  establishConnection: (options: RealtimeConnectionOptions) => Promise<string>;
  disconnect: () => void;
  isConnected: () => boolean;
  sendAudio: (data: ArrayBuffer) => void;
  onAudioData: (callback: (data: ArrayBuffer) => void) => void;
}

class RealtimeServiceImpl implements RealtimeService {
  private ws: WebSocket | null = null;
  private connectionId: string | null = null;

  async establishConnection(options: RealtimeConnectionOptions): Promise<string> {
    const response = await api.post<{ connection_id: string }>('/v1/realtime', {
      model: options.model,
      audio_format: options.audioFormat || 'mp3',
      sample_rate: options.sampleRate || 24000,
    });

    this.connectionId = response.data.connection_id;

    const workspaceApiUrl = useWorkspaceStore.getState().getCurrentApiUrl();
    const wsBaseUrl = workspaceApiUrl.replace('http', 'ws').replace('https', 'wss');

    const wsUrl = `${wsBaseUrl}/v1/realtime/${this.connectionId}`;
    this.ws = new WebSocket(wsUrl);

    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error('Failed to create WebSocket connection'));

      this.ws.onopen = () => {
        console.log('Realtime WebSocket connection established');
        resolve(this.connectionId!);
      };

      this.ws.onerror = (error) => {
        console.error('Realtime WebSocket error:', error);
        reject(new Error('WebSocket connection failed'));
      };

      this.ws.onclose = () => {
        console.log('Realtime WebSocket connection closed');
        this.ws = null;
        this.connectionId = null;
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionId = null;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  sendAudio(audioData: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    }
  }

  onAudioData(callback: (data: ArrayBuffer) => void): void {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          callback(event.data);
        } else {
          try {
            const json = JSON.parse(event.data);
            if (json.audio) {
              const audioData = this.base64ToArrayBuffer(json.audio);
              callback(audioData);
            }
          } catch (e) {
            console.error('Error parsing realtime message:', e);
          }
        }
      };
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const realtimeService: RealtimeService = new RealtimeServiceImpl();
