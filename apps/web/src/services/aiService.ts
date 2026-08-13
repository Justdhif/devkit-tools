import { apiClient } from '../lib/apiClient';
import {
  AiExplainErrorRequest,
  AiExplainErrorResponse,
  AiGenerateRegexRequest,
  AiGenerateRegexResponse,
  AiGenerateSqlRequest,
  AiGenerateSqlResponse,
  AiConvertJsonRequest,
  AiConvertJsonResponse,
  AiExplainCodeRequest,
  AiExplainCodeResponse,
} from '@devkit/shared';

async function postAi<TRequest, TResponse>(endpoint: string, body: TRequest): Promise<TResponse> {
  const res = await apiClient.post<{ success: boolean; data: TResponse }>(`/ai/${endpoint}`, body);
  return res.data.data;
}

export const aiService = {
  explainError: (data: AiExplainErrorRequest) =>
    postAi<AiExplainErrorRequest, AiExplainErrorResponse>('explain-error', data),

  generateRegex: (data: AiGenerateRegexRequest) =>
    postAi<AiGenerateRegexRequest, AiGenerateRegexResponse>('generate-regex', data),

  generateSql: (data: AiGenerateSqlRequest) =>
    postAi<AiGenerateSqlRequest, AiGenerateSqlResponse>('generate-sql', data),

  convertJson: (data: AiConvertJsonRequest) =>
    postAi<AiConvertJsonRequest, AiConvertJsonResponse>('convert-json', data),

  explainCode: (data: AiExplainCodeRequest) =>
    postAi<AiExplainCodeRequest, AiExplainCodeResponse>('explain-code', data),
};
