import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToolHistoryItem, UserWorkspace, UserSettings } from '@devkit/shared';
import { useAuthStore } from './useAuthStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface DevKitStoreState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;

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

      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

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
        } catch (err) {
          // Keep current favorites on network error
        }
      },

      toggleFavorite: async (slug: string) => {
        const { token, isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated || !token) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return;
        }

        const exists = get().favorites.includes(slug);
        const newFavs = exists
          ? get().favorites.filter((s) => s !== slug)
          : [...get().favorites, slug];
        
        // Optimistic update
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
        } catch (err) {
          // Keep optimistic state
        }
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
        if (isSensitive && settings.privacy.donotSaveSensitive) return;

        const newItem: ToolHistoryItem = {
          id: Math.random().toString(36).slice(2, 9),
          toolSlug,
          timestamp: Date.now(),
          inputSummary: isSensitive ? '[REDACTED]' : inputSummary?.slice(0, 80),
          isSensitive,
        };

        set({ history: [newItem, ...history.slice(0, 49)] });
      },
      clearHistory: () => set({ history: [] }),

      workspaces: [
        {
          id: 'default-backend',
          name: 'My Backend Toolkit',
          description: 'Essential utilities for REST API development',
          toolSlugs: ['jwt-decoder', 'json-formatter', 'hash-generator', 'uuid-generator'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
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
    }
  )
);
