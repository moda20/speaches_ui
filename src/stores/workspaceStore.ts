import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import env from '@/lib/env';

export interface Workspace {
  id: string;
  name: string;
  targetUrl: string;
  isDefault: boolean;
  createdAt: number;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentWorkspace: Workspace | null;
  setCurrentWorkspaceId: (id: string | null) => void;
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'isDefault'>) => void;
  removeWorkspace: (id: string) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  initializeFromEnv: () => void;
  getCurrentApiUrl: () => string;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspaceId: null,
      currentWorkspace: null,

      setCurrentWorkspaceId: (id) => {
        set({ currentWorkspaceId: id });
        const workspace = get().workspaces.find((w) => w.id === id);
        set({ currentWorkspace: workspace || null });
      },

      addWorkspace: (workspace) => {
        const newWorkspace: Workspace = {
          id: `ws-${Date.now()}`,
          name: workspace.name,
          targetUrl: workspace.targetUrl,
          isDefault: false,
          createdAt: Date.now(),
        };
        set((state) => ({
          workspaces: [newWorkspace, ...state.workspaces],
          currentWorkspaceId: newWorkspace.id,
          currentWorkspace: newWorkspace,
        }));
      },

      removeWorkspace: (id) => {
        const workspace = get().workspaces.find((w) => w.id === id);

        if (workspace?.isDefault) {
          console.warn('Cannot delete default workspace');
          return;
        }

        if (get().currentWorkspaceId === id) {
          console.warn('Cannot delete current workspace');
          return;
        }

        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
        }));
      },

      updateWorkspace: (id, updates) => {
        set((state) => {
          const updatedWorkspaces = state.workspaces.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          );

          let updatedCurrentWorkspace = state.currentWorkspace;
          if (state.currentWorkspaceId === id && state.currentWorkspace) {
            updatedCurrentWorkspace = { ...state.currentWorkspace, ...updates } as Workspace;
          }

          return {
            workspaces: updatedWorkspaces,
            currentWorkspace: updatedCurrentWorkspace,
          };
        });
      },

      initializeFromEnv: () => {
        const state = get();

        const defaultWorkspaceExists = state.workspaces.some((w) => w.isDefault);

        if (!defaultWorkspaceExists) {
          const defaultWorkspace: Workspace = {
            id: 'default',
            name: 'default',
            targetUrl: env.VITE_API_URL,
            isDefault: true,
            createdAt: Date.now(),
          };

          set({
            workspaces: [defaultWorkspace],
            currentWorkspaceId: 'default',
            currentWorkspace: defaultWorkspace,
          });
        } else if (!state.currentWorkspaceId) {
          const defaultWorkspace = state.workspaces.find((w) => w.isDefault);
          if (defaultWorkspace) {
            set({
              currentWorkspaceId: defaultWorkspace.id,
              currentWorkspace: defaultWorkspace,
            });
          }
        }
      },

      getCurrentApiUrl: () => {
        const state = get();
        if (state.currentWorkspace) {
          return state.currentWorkspace.targetUrl;
        }

        return env.VITE_API_URL;
      },
    }),
    {
      name: 'workspaces-storage',
    }
  )
);
