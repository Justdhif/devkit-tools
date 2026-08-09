import { AiService } from './ai.service';
import { AiExplainErrorRequest, AiGenerateRegexRequest, AiGenerateSqlRequest, AiConvertJsonRequest, AiExplainCodeRequest } from '@devkit/shared';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    explainError(body: AiExplainErrorRequest): Promise<{
        success: boolean;
        data: import("@devkit/shared").AiExplainErrorResponse;
    }>;
    generateRegex(body: AiGenerateRegexRequest): Promise<{
        success: boolean;
        data: import("@devkit/shared").AiGenerateRegexResponse;
    }>;
    generateSql(body: AiGenerateSqlRequest): Promise<{
        success: boolean;
        data: import("@devkit/shared").AiGenerateSqlResponse;
    }>;
    convertJson(body: AiConvertJsonRequest): Promise<{
        success: boolean;
        data: import("@devkit/shared").AiConvertJsonResponse;
    }>;
    explainCode(body: AiExplainCodeRequest): Promise<{
        success: boolean;
        data: import("@devkit/shared").AiExplainCodeResponse;
    }>;
}
