import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioState {
  currentFile: File | null;
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  setCurrentFile: (file: File | null) => void;
  setAudioUrl: (url: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      currentFile: null,
      audioUrl: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      playbackRate: 1,

      setCurrentFile: (file) => set({ currentFile: file }),

      setAudioUrl: (url) => set({ audioUrl: url }),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      setCurrentTime: (time) => set({ currentTime: time }),

      setDuration: (duration) => set({ duration }),

      setVolume: (volume) => set({ volume }),

      setPlaybackRate: (rate) => set({ playbackRate: rate }),

      reset: () =>
        set({
          currentFile: null,
          audioUrl: null,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          volume: 1,
          playbackRate: 1,
        }),
    }),
    {
      name: 'audio-storage',
      partialize: (state) => ({
        volume: state.volume,
        playbackRate: state.playbackRate,
      }),
    }
  )
);
