import api from '@/lib/api';
import type { components } from '@/types/api';

type EmbeddingRequestBody =
  components['schemas']['Body_create_speech_embedding_v1_audio_speech_embedding_post'];

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  audio_id: string;
}

export interface EmbeddingService {
  createSpeechEmbedding: (file: File, model: string) => Promise<EmbeddingResult>;
}

export const embeddingsService: EmbeddingService = {
  async createSpeechEmbedding(file, model) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);

    const response = await api.post<EmbeddingResult>('/v1/audio/speech/embedding', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
