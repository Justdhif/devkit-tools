import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

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
          const authData = await authService.loginOAuth({ provider, ...details });
          set({
            user: authData.user,
            token: authData.accessToken,
            refreshToken: authData.refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: any) {
          set({ error: err.message || `${provider} authentication failed`, isLoading: false });
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
          const newTokens = await authService.refreshTokens(refreshToken);
          set({
            token: newTokens.accessToken,
            refreshToken: newTokens.refreshToken || refreshToken,
            isAuthenticated: true,
          });
          return true;
        } catch (err) {
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
          return false;
        }
      },

      fetchMe: async () => {
        const { token, refreshToken } = get();
        if (!token && !refreshToken) return;

        if (token) {
          try {
            const me = await authService.getMe();
            set({
              user: me,
              isAuthenticated: true,
            });
            return;
          } catch (err) {}
        }

        if (refreshToken) {
          const refreshed = await get().refreshTokens();
          if (refreshed) return;
        }

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
