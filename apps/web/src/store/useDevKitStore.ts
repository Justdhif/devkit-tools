import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToolHistoryItem, UserWorkspace, UserSettings, ToolPipeline } from '@devkit/shared';
import { redactSensitiveData } from '@devkit/tool-core';
import { useAuthStore } from './useAuthStore';
import { favoriteService } from '../services/favoriteService';
import { historyService } from '../services/historyService';
import { pipelineService } from '../services/pipelineService';

interface DevKitStoreState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  isProfileDrawerOpen: boolean;
  setProfileDrawerOpen: (open: boolean) => void;
  toggleProfileDrawer: () => void;

  favorites: string[];
  fetchFavoritesFromDB: () => Promise<void>;
  toggleFavorite: (slug: string) => Promise<void>;
  isFavorite: (slug: string) => boolean;

  history: ToolHistoryItem[];
  addHistoryItem: (toolSlug: string, inputSummary?: string, isSensitive?: boolean) => void;
  clearHistory: () => void;

  workspaces: UserWorkspace[];
  addWorkspace: (name: string, toolSlugs: string[], description?: string) => void;
  removeWorkspace: (id: string) => void;

  savedPipelines: ToolPipeline[];
  fetchPipelinesFromDB: () => Promise<void>;
  savePipelineToDB: (pipeline: Partial<ToolPipeline> & { name: string; steps: any[] }) => Promise<{ success: boolean; data?: any; error?: string }>;
  deletePipelineFromDB: (id: string) => Promise<boolean>;

  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const useDevKitStore = create<DevKitStoreState>()(
  persist(
    (set, get) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      isProfileDrawerOpen: false,
      setProfileDrawerOpen: (open) => set({ isProfileDrawerOpen: open }),
      toggleProfileDrawer: () => set((state) => ({ isProfileDrawerOpen: !state.isProfileDrawerOpen })),

      favorites: [],

      fetchFavoritesFromDB: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          set({ favorites: [] });
          return;
        }
        try {
          const favs = await favoriteService.getFavorites();
          set({ favorites: favs });
        } catch (err) {}
      },

      toggleFavorite: async (slug: string) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          set({ isProfileDrawerOpen: true });
          return;
        }

        const exists = get().favorites.includes(slug);
        const newFavs = exists
          ? get().favorites.filter((s) => s !== slug)
          : [...get().favorites, slug];
        
        set({ favorites: newFavs });

        try {
          const updatedFavs = await favoriteService.toggleFavorite(slug);
          set({ favorites: updatedFavs });
        } catch (err) {}
      },

      isFavorite: (slug) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return false;
        return get().favorites.includes(slug);
      },

      history: [],
      addHistoryItem: (toolSlug, inputSummary, isSensitive = false) => {
        const { settings, history } = get();
        if (!settings.privacy.saveHistory) return;

        const redacted = redactSensitiveData(inputSummary || '');
        const finalSensitive = isSensitive || redacted.isSensitive;

        if (finalSensitive && settings.privacy.donotSaveSensitive) return;

        const newItem: ToolHistoryItem = {
          id: Math.random().toString(36).slice(2, 9),
          toolSlug,
          timestamp: Date.now(),
          inputSummary: finalSensitive ? '[REDACTED_SECRET]' : redacted.redactedText.slice(0, 80),
          isSensitive: finalSensitive,
        };

        set({ history: [newItem, ...history.slice(0, 49)] });

        // Sync ke database jika user login via historyService
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated && !finalSensitive) {
          historyService
            .addHistory({
              toolSlug,
              inputSummary: redacted.redactedText.slice(0, 200),
              isSensitive: finalSensitive,
            })
            .catch(() => null);
        }
      },
      clearHistory: () => {
        set({ history: [] });
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          historyService.clearHistory().catch(() => null);
        }
      },

      workspaces: [],
      addWorkspace: (name, toolSlugs, description) =>
        set((state) => ({
          workspaces: [
            ...state.workspaces,
            {
              id: Math.random().toString(36).slice(2, 9),
              name,
              description,
              toolSlugs,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      removeWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
        })),

      savedPipelines: [],

      fetchPipelinesFromDB: async () => {
        try {
          const pipelines = await pipelineService.getPipelines();
          set({ savedPipelines: pipelines });
        } catch (err) {}
      },



      savePipelineToDB: async (pipeline) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          // Fallback local save if guest mode
          const newPipe: ToolPipeline = {
            id: pipeline.id || `pipeline-${Date.now()}`,
            name: pipeline.name,
            description: pipeline.description,
            initialInput: pipeline.initialInput,
            steps: pipeline.steps,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const existing = get().savedPipelines.findIndex((p) => p.id === newPipe.id);
          let updatedList: ToolPipeline[];
          if (existing >= 0) {
            updatedList = [...get().savedPipelines];
            updatedList[existing] = newPipe;
          } else {
            updatedList = [newPipe, ...get().savedPipelines];
          }
          set({ savedPipelines: updatedList });
          return { success: true, data: newPipe };
        }

        try {
          const saved = await pipelineService.savePipeline({
            id: pipeline.id,
            name: pipeline.name,
            description: pipeline.description,
            initialInput: pipeline.initialInput,
            steps: pipeline.steps,
          });
          await get().fetchPipelinesFromDB();
          return { success: true, data: saved };
        } catch (err: any) {
          return { success: false, error: err.message || 'Failed to save pipeline to Neon DB' };
        }
      },

      deletePipelineFromDB: async (id) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          set({ savedPipelines: get().savedPipelines.filter((p) => p.id !== id) });
          return true;
        }

        try {
          const success = await pipelineService.deletePipeline(id);
          if (success) {
            await get().fetchPipelinesFromDB();
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      settings: {
        appearance: 'dark',
        editor: {
          fontSize: 14,
          tabSize: 2,
          wordWrap: true,
          minimap: false,
        },
        behavior: {
          autoFormat: true,
          autoSave: false,
          confirmBeforeClear: true,
        },
        privacy: {
          saveHistory: true,
          donotSaveSensitive: true,
        },
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'devkit-storage',
      partialize: (state) => ({
        history: state.history,
        workspaces: state.workspaces,
        settings: state.settings,
      }),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          const legacyIds = ['default-backend'];
          if (persistedState?.workspaces) {
            persistedState.workspaces = persistedState.workspaces.filter(
              (w: any) => !legacyIds.includes(w.id)
            );
          }
        }
        return persistedState;
      },
    }
  )
);
