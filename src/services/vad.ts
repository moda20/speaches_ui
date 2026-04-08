import api from '@/lib/api';
import type { components } from '@/types/api';

type VADRequestBody =
  components['schemas']['Body_detect_speech_timestamps_v1_audio_speech_timestamps_post'];
type SpeechTimestamp = components['schemas']['SpeechTimestamp'];

export interface VADOptions {
  model?: string;
  threshold?: number;
  neg_threshold?: number;
  min_speech_duration_ms?: number;
  max_speech_duration_s?: number;
  min_silence_duration_ms?: number;
  speech_pad_ms?: number;
}

export interface VADService {
  detectSpeechTimestamps: (file: File, options?: VADOptions) => Promise<SpeechTimestamp[]>;
}

export const vadService: VADService = {
  async detectSpeechTimestamps(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', options.model || 'silero_vad_v5');
    formData.append('threshold', String(options.threshold ?? 0.75));
    formData.append('min_speech_duration_ms', String(options.min_speech_duration_ms ?? 0));
    formData.append('min_silence_duration_ms', String(options.min_silence_duration_ms ?? 1000));
    formData.append('speech_pad_ms', String(options.speech_pad_ms ?? 0));

    if (options.neg_threshold !== undefined) {
      formData.append('neg_threshold', String(options.neg_threshold));
    }
    if (options.max_speech_duration_s !== undefined) {
      formData.append('max_speech_duration_s', String(options.max_speech_duration_s));
    }

    const response = await api.post<SpeechTimestamp[]>('/v1/audio/speech/timestamps', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
