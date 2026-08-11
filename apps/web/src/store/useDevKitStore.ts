import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToolHistoryItem, UserWorkspace, UserSettings } from '@devkit/shared';
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
