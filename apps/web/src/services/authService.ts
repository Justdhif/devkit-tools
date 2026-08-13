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
  async loginOAuth(payload: OAuthPayload): Promise<AuthResponse['data']> {
    const res = await apiClient.post<AuthResponse>('/auth/oauth', payload);
    return res.data.data;
  },

  /**
   * Fetch authenticated user details
   */
  async getMe(): Promise<AuthUser> {
    const res = await apiClient.get<{ success: boolean; data: AuthUser }>('/auth/me');
    return res.data.data;
  },

  /**
   * Refresh expired JWT tokens
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await apiClient.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      '/auth/refresh',
      { refreshToken }
    );
    return res.data.data;
  },
};
