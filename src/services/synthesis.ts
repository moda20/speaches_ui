import api from '@/lib/api';
import type { components } from '@/types/api';

type SpeechResponseFormat = components['schemas']['SpeechResponseFormat'];

export interface SynthesisOptions {
  model: string;
  input: string;
  voice: string;
  response_format?: SpeechResponseFormat;
  speed?: number;
  sample_rate?: number;
  stream?: boolean;
}

export interface SynthesisService {
  synthesizeSpeech: (options: SynthesisOptions) => Promise<Blob>;
}

export const synthesisService: SynthesisService = {
  async synthesizeSpeech(options) {
    const response = await api.post<Blob>(
      '/v1/audio/speech',
      {
        model: options.model,
        input: options.input,
        voice: options.voice,
        response_format: options.response_format || 'mp3',
        speed: options.speed || 1.0,
        ...(options.sample_rate && { sample_rate: options.sample_rate }),
        ...(options.stream !== undefined && { stream: options.stream }),
      },
      {
        responseType: 'blob',
      }
    );

    return response.data;
  },
};
