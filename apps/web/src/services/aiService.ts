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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function postAi<TRequest, TResponse>(endpoint: string, body: TRequest): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || json.error || 'Failed to execute AI request');
  }

  return json.data as TResponse;
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
