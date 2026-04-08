import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Model {
  id: string;
  task: string;
  language?: string[];
  owned_by: string;
  created?: number;
}

interface ModelsState {
  selectedModel: string | null;
  favoriteModels: string[];
  recentlyUsed: string[];
  setSelectedModel: (modelId: string | null) => void;
  toggleFavorite: (modelId: string) => void;
  addToRecentlyUsed: (modelId: string) => void;
  clearFavorites: () => void;
  clearRecentlyUsed: () => void;
}

export const useModelsStore = create<ModelsState>()(
  persist(
    (set) => ({
      selectedModel: null,
      favoriteModels: [],
      recentlyUsed: [],

      setSelectedModel: (modelId) => set({ selectedModel: modelId }),

      toggleFavorite: (modelId) =>
        set((state) => ({
          favoriteModels: state.favoriteModels.includes(modelId)
            ? state.favoriteModels.filter((id) => id !== modelId)
            : [...state.favoriteModels, modelId],
        })),

      addToRecentlyUsed: (modelId) =>
        set((state) => {
          const filtered = state.recentlyUsed.filter((id) => id !== modelId);
          return {
            recentlyUsed: [modelId, ...filtered].slice(0, 10),
          };
        }),

      clearFavorites: () => set({ favoriteModels: [] }),

      clearRecentlyUsed: () => set({ recentlyUsed: [] }),
    }),
    {
      name: 'models-storage',
    }
  )
);
