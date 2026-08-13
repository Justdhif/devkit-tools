import { apiClient } from '../lib/apiClient';

export const favoriteService = {
  /**
   * Fetch user favorite tool slugs from DB
   */
  async getFavorites(): Promise<string[]> {
    const res = await apiClient.get<{ success: boolean; data: string[] }>('/favorites');
    return res.data.data || [];
  },

  /**
   * Toggle a tool favorite status in DB
   */
  async toggleFavorite(toolSlug: string): Promise<string[]> {
    const res = await apiClient.post<{ success: boolean; data: string[] }>('/favorites/toggle', { toolSlug });
    return res.data.data || [];
  },
};
