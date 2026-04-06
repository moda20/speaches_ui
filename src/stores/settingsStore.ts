import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  language: string;
  timezone: string;
  dateFormat: string;
  density: "comfortable" | "compact" | "spacious";
  updateSettings: (settings: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      density: "comfortable",
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: "settings-storage",
    },
  ),
);
