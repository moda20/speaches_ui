import api from '@/lib/api';
import type { components } from '@/types/api';

type Model = components['schemas']['Model'];
type ListModelsResponse = components['schemas']['ListModelsResponse'];
type ListAudioModelsResponse = components['schemas']['ListAudioModelsResponse'];
type RunningModelsResponse = components['schemas']['RunningModelsResponse'];

export interface ModelService {
  getLocalModels: (task?: string) => Promise<Model[]>;
  getAudioModels: () => Promise<Model[]>;
  getAudioVoices: () => Promise<string[]>;
  getModelDetails: (modelId: string) => Promise<Model>;
  downloadModel: (modelId: string) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  getRemoteModels: (task?: string) => Promise<Model[]>;
  getRunningModels: () => Promise<string[]>;
  loadModel: (modelId: string) => Promise<void>;
  unloadModel: (modelId: string) => Promise<void>;
}

export const modelsService: ModelService = {
  async getLocalModels(task?: string) {
    const response = await api.get<ListModelsResponse>('/v1/models', {
      params: task ? { task } : undefined,
    });
    return response.data.data;
  },

  async getAudioModels() {
    const response = await api.get<ListAudioModelsResponse>('/v1/audio/models');
    return response.data.models;
  },

  async getAudioVoices() {
    const response = await api.get<unknown>('/v1/audio/voices');
    const data = response.data;

    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]) {
        return data.map((voice) => (voice as { id: string }).id);
      }
      return data as string[];
    }

    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if ('data' in obj && Array.isArray(obj.data)) {
        const voices = obj.data;
        if (
          voices.length > 0 &&
          typeof voices[0] === 'object' &&
          voices[0] !== null &&
          'id' in voices[0]
        ) {
          return voices.map((voice) => (voice as { id: string }).id);
        }
        return voices as string[];
      }
      if ('voices' in obj && Array.isArray(obj.voices)) {
        const voices = obj.voices;
        if (
          voices.length > 0 &&
          typeof voices[0] === 'object' &&
          voices[0] !== null &&
          'id' in voices[0]
        ) {
          return voices.map((voice) => (voice as { id: string }).id);
        }
        return voices as string[];
      }
    }

    return [];
  },

  async getModelDetails(modelId: string) {
    const response = await api.get<{ data: Model }>(`/v1/models/${modelId}`);
    return response.data.data;
  },

  async downloadModel(modelId: string) {
    await api.post(`/v1/models/${modelId}`);
  },

  async deleteModel(modelId: string) {
    await api.delete(`/v1/models/${modelId}`);
  },

  async getRemoteModels(task?: string) {
    const response = await api.get<ListModelsResponse>('/v1/registry', {
      params: task ? { task } : undefined,
    });
    return response.data.data;
  },

  async getRunningModels() {
    const response = await api.get<RunningModelsResponse>('/api/ps');
    return response.data.models;
  },

  async loadModel(modelId: string) {
    await api.post(`/api/ps/${modelId}`);
  },

  async unloadModel(modelId: string) {
    await api.delete(`/api/ps/${modelId}`);
  },
};
