import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider?: string;
  avatarUrl?: string;
}

interface AuthStoreState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  loginOAuth: (
    provider: 'github' | 'google',
    details?: { email?: string; name?: string; avatarUrl?: string }
  ) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      loginOAuth: async (provider, details = {}) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, ...details }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            set({ error: data.message || `${provider} authentication failed`, isLoading: false });
            return false;
          }

          set({
            user: data.user,
            token: data.accessToken || data.token,
            refreshToken: data.refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: any) {
          set({ error: 'Network error. Please try again.', isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, error: null });
      },

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            set({
              user: data.user,
              token: data.accessToken || data.token,
              refreshToken: data.refreshToken || refreshToken,
              isAuthenticated: true,
            });
            return true;
          }
        } catch (err) {}

        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        return false;
      },

      fetchMe: async () => {
        const { token, refreshToken } = get();
        if (!token && !refreshToken) return;

        // Kalau ada access token, coba dulu
        if (token) {
          try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
              set({
                user: data.user,
                token: data.accessToken || data.token || token,
                refreshToken: data.refreshToken || refreshToken,
                isAuthenticated: true,
              });
              return;
            }
          } catch (err) {}
        }

        // Access token expired atau gagal — coba refresh
        if (refreshToken) {
          const refreshed = await get().refreshTokens();
          if (refreshed) return; // berhasil, token baru sudah di-set
        }

        // Keduanya gagal, logout
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'devkit-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
