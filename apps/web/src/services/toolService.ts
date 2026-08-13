import { apiClient } from '../lib/apiClient';
import { CORE_TOOLS } from '@devkit/tool-core';
import type { ToolMetadata } from '@devkit/shared';


export const toolService = {
  /**
   * Fetch all tools from backend API (with fallback to CORE_TOOLS)
   */
  async getTools(): Promise<ToolMetadata[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: ToolMetadata[] }>('/tools');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data;
      }
    } catch {
      // Graceful fallback to static CORE_TOOLS if API is unavailable
    }
    return CORE_TOOLS;
  },

  /**
   * Fetch a specific tool by slug from backend API (with fallback)
   */
  async getToolBySlug(slug: string): Promise<ToolMetadata | undefined> {
    try {
      const res = await apiClient.get<{ success: boolean; data: ToolMetadata }>(`/tools/${slug}`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch {
      // Graceful fallback
    }
    return CORE_TOOLS.find((t) => t.slug === slug);
  },
};
