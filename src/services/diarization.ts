import api from '@/lib/api';
import type { components } from '@/types/api';

type DiarizationRequestBody = components['schemas']['Body_diarize_audio_v1_audio_diarization_post'];

export interface DiarizationSegment {
  speaker: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface DiarizationResult {
  segments: DiarizationSegment[];
  language?: string;
  audio_duration?: number;
}

export interface DiarizationOptions {
  known_speaker_names?: string[];
  known_speaker_references?: File[];
  response_format?: 'json' | 'rttm';
}

export interface DiarizationService {
  diarizeAudio: (file: File, options?: DiarizationOptions) => Promise<DiarizationResult>;
}

export const diarizationService: DiarizationService = {
  async diarizeAudio(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    if (options.response_format) {
      formData.append('response_format', options.response_format);
    }

    if (options.known_speaker_names && options.known_speaker_names.length > 0) {
      formData.append('known_speaker_names', JSON.stringify(options.known_speaker_names));
    }

    if (options.known_speaker_references) {
      for (const refFile of options.known_speaker_references) {
        formData.append('known_speaker_references', refFile);
      }
    }

    const response = await api.post<DiarizationResult>('/v1/audio/diarization', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
