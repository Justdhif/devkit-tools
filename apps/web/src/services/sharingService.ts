import { apiClient } from '../lib/apiClient';

export interface SharePayload {
  toolSlug: string;
  toolName: string;
  input: string;
  output: string;
  options?: any;
}

export interface SharedData {
  id: string;
  toolSlug: string;
  toolName: string;
  input: string;
  output: string;
  options?: any;
  createdAt: string;
}

export const sharingService = {
  /**
   * Create a shareable URL for tool execution output
   */
  async createShare(payload: SharePayload): Promise<{ id: string; url: string }> {
    const res = await apiClient.post<{ success: boolean; data: { id: string; url: string } }>('/sharing', payload);
    return res.data.data;
  },

  /**
   * Retrieve shared tool output by share ID
   */
  async getShare(id: string): Promise<SharedData> {
    const res = await apiClient.get<{ success: boolean; data: SharedData }>(`/sharing/${id}`);
    return res.data.data;
  },
};
