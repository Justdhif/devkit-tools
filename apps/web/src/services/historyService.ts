import { apiClient } from '../lib/apiClient';
import { HistoryItem } from '@devkit/shared';

export const historyService = {
  /**
   * Fetch execution history from DB
   */
  async getHistory(): Promise<HistoryItem[]> {
    const res = await apiClient.get<{ success: boolean; data: HistoryItem[] }>('/history');
    return res.data.data || [];
  },

  /**
   * Save a new execution history item to DB
   */
  async addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem> {
    const res = await apiClient.post<{ success: boolean; data: HistoryItem }>('/history', item);
    return res.data.data;
  },

  /**
   * Clear all history records from DB
   */
  async clearHistory(): Promise<boolean> {
    const res = await apiClient.delete<{ success: boolean }>('/history');
    return res.data.success;
  },
};
