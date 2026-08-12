import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToolHistoryItem, UserWorkspace, UserSettings, ToolPipeline } from '@devkit/shared';
import { redactSensitiveData } from '@devkit/tool-core';
import { useAuthStore } from './useAuthStore';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
        const { token, isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated || !token) {
          set({ favorites: [] });
          return;
        }
        try {
          const res = await fetch(`${API_BASE_URL}/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data)) {
            set({ favorites: data.data });
          }
        } catch (err) {}
      },

      toggleFavorite: async (slug: string) => {
        const { token, isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated || !token) {
          set({ isProfileDrawerOpen: true });
          return;
        }

        const exists = get().favorites.includes(slug);
        const newFavs = exists
          ? get().favorites.filter((s) => s !== slug)
          : [...get().favorites, slug];
        
        set({ favorites: newFavs });

        try {
          const res = await fetch(`${API_BASE_URL}/favorites/toggle`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ toolSlug: slug }),
          });
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data)) {
            set({ favorites: data.data });
          }
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

        // Sync ke database jika user login (async, tidak blocking)
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated && !finalSensitive) {
          const syncToDb = async () => {
            let { token } = useAuthStore.getState();
            const payload = {
              toolSlug,
              inputSummary: redacted.redactedText.slice(0, 200),
              isSensitive: finalSensitive,
            };
            const doPost = (t: string) =>
              fetch(`${API_BASE_URL}/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
                body: JSON.stringify(payload),
              });

            const res = await doPost(token!).catch(() => null);
            if (res && res.status === 401) {
              // Token expired — coba refresh dulu lalu retry sekali
              const refreshed = await useAuthStore.getState().refreshTokens();
              if (refreshed) {
                const newToken = useAuthStore.getState().token;
                if (newToken) await doPost(newToken).catch(() => null);
              }
            }
          };
          syncToDb();
        }
      },
      clearHistory: () => set({ history: [] }),

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
        const { token, isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated || !token) {
          return;
        }
        try {
          const res = await fetch(`${API_BASE_URL}/pipelines`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data)) {
            set({ savedPipelines: data.data });
          }
        } catch (err) {}
      },

      savePipelineToDB: async (pipeline) => {
        const { token, isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated || !token) {
          useAuthStore.getState();
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
          const res = await fetch(`${API_BASE_URL}/pipelines`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(pipeline),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            await get().fetchPipelinesFromDB();
            return { success: true, data: data.data };
          }
          return { success: false, error: data.error || 'Failed to save pipeline' };
        } catch (err: any) {
          return { success: false, error: err.message || 'Network error saving pipeline' };
        }
      },

      deletePipelineFromDB: async (id) => {
        const { token, isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated || !token) {
          set({ savedPipelines: get().savedPipelines.filter((p) => p.id !== id) });
          return true;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/pipelines/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.success) {
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
          // Hapus workspace default hardcoded lama yang tidak seharusnya ada
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
