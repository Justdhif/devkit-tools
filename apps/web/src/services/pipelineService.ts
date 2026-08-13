import { apiClient } from '../lib/apiClient';
import { ToolPipeline } from '@devkit/shared';

export interface SavePipelinePayload {
  id?: string;
  name: string;
  description?: string;
  initialInput?: string;
  steps: any[];
}

export const pipelineService = {
  /**
   * Fetch saved pipelines directly from Neon DB
   */
  async getPipelines(): Promise<ToolPipeline[]> {
    const res = await apiClient.get<{ success: boolean; data: ToolPipeline[] }>('/pipelines');
    return res.data.data || [];
  },

  /**
   * Save or update a pipeline in Neon DB
   */
  async savePipeline(payload: SavePipelinePayload): Promise<ToolPipeline> {
    const res = await apiClient.post<{ success: boolean; data: ToolPipeline }>('/pipelines', payload);
    return res.data.data;
  },

  /**
   * Delete a saved pipeline from Neon DB
   */
  async deletePipeline(id: string): Promise<boolean> {
    const res = await apiClient.delete<{ success: boolean }>(`/pipelines/${id}`);
    return res.data.success;
  },
};
