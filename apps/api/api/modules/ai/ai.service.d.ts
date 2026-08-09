import { AiExplainErrorRequest, AiExplainErrorResponse, AiGenerateRegexRequest, AiGenerateRegexResponse, AiGenerateSqlRequest, AiGenerateSqlResponse, AiConvertJsonRequest, AiConvertJsonResponse, AiExplainCodeRequest, AiExplainCodeResponse } from '@devkit/shared';
export declare class AiService {
    private getApiKey;
    private callGroq;
    explainError(dto: AiExplainErrorRequest): Promise<AiExplainErrorResponse>;
    generateRegex(dto: AiGenerateRegexRequest): Promise<AiGenerateRegexResponse>;
    generateSql(dto: AiGenerateSqlRequest): Promise<AiGenerateSqlResponse>;
    convertJson(dto: AiConvertJsonRequest): Promise<AiConvertJsonResponse>;
    explainCode(dto: AiExplainCodeRequest): Promise<AiExplainCodeResponse>;
}
