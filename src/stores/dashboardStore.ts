import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DashboardFilters {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  category: string | null;
  status: string | null;
}

interface DashboardState {
  sidebarOpen: boolean;
  selectedView: string;
  filters: DashboardFilters;
  setSidebarOpen: (open: boolean) => void;
  setSelectedView: (view: string) => void;
  setFilters: (filters: DashboardFilters) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      selectedView: "overview",
      filters: {
        dateRange: {
          from: undefined,
          to: undefined,
        },
        category: null,
        status: null,
      },
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSelectedView: (view) => set({ selectedView: view }),
      setFilters: (filters) => set({ filters }),
    }),
    {
      name: "dashboard-storage",
    },
  ),
);
