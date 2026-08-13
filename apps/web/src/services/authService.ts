import { apiClient } from '../lib/apiClient';
import { AuthUser } from '../store/useAuthStore';

export interface OAuthPayload {
  provider: 'github' | 'google';
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  /**
   * OAuth login / registration API
   */
  async loginOAuth(payload: OAuthPayload): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
    const res = await apiClient.post<any>('/auth/oauth', payload);
    const data = res.data;
    return {
      user: data.user || data.data?.user,
      accessToken: data.accessToken || data.token || data.data?.accessToken,
      refreshToken: data.refreshToken || data.data?.refreshToken,
    };
  },

  /**
   * Fetch authenticated user details
   */
  async getMe(): Promise<{ user: AuthUser; accessToken?: string; refreshToken?: string }> {
    const res = await apiClient.get<any>('/auth/me');
    const data = res.data;
    return {
      user: data.user || data.data?.user || data.data,
      accessToken: data.accessToken || data.token,
      refreshToken: data.refreshToken,
    };
  },

  /**
   * Refresh expired JWT tokens
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await apiClient.post<any>('/auth/refresh', { refreshToken });
    const data = res.data;
    return {
      accessToken: data.accessToken || data.token || data.data?.accessToken,
      refreshToken: data.refreshToken || data.data?.refreshToken,
    };
  },
};

