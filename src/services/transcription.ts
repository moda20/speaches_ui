import api from '@/lib/api';
import type { components } from '@/types/api';

type TranscribeRequestBody =
  components['schemas']['Body_transcribe_file_v1_audio_transcriptions_post'];
type TranslateRequestBody = components['schemas']['Body_translate_file_v1_audio_translations_post'];

export interface TranscriptionResult {
  text: string;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

export interface TranscriptionService {
  transcribeFile: (
    file: File,
    options: Partial<TranscribeRequestBody>
  ) => Promise<TranscriptionResult>;
  translateFile: (
    file: File,
    options: Partial<TranslateRequestBody>
  ) => Promise<TranscriptionResult>;
}

export const transcriptionService: TranscriptionService = {
  async transcribeFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', options.model || 'whisper-1');

    if (options.language) {
      formData.append('language', options.language);
    }
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }
    if (options.response_format) {
      formData.append('response_format', options.response_format);
    }
    if (options.temperature !== undefined) {
      formData.append('temperature', String(options.temperature));
    }
    if (options.timestamp_granularities) {
      formData.append('timestamp_granularities', JSON.stringify(options.timestamp_granularities));
    }
    if (options.stream !== undefined) {
      formData.append('stream', String(options.stream));
    }
    if (options.hotwords) {
      formData.append('hotwords', options.hotwords);
    }
    if (options.without_timestamps !== undefined) {
      formData.append('without_timestamps', String(options.without_timestamps));
    }

    const response = await api.post<TranscriptionResult>('/v1/audio/transcriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async translateFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', options.model || 'whisper-1');

    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }
    if (options.response_format) {
      formData.append('response_format', options.response_format);
    }
    if (options.temperature !== undefined) {
      formData.append('temperature', String(options.temperature));
    }

    const response = await api.post<TranscriptionResult>('/v1/audio/translations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
