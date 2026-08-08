import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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

@Injectable()
export class AiService {
  private getApiKey(): string {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new HttpException(
        'GROQ_API_KEY is not configured on the server',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return apiKey;
  }

  private async callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = this.getApiKey();

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new HttpException(
          `Groq API Error (${response.status}): ${errBody}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new HttpException('Empty response received from Groq LLM', HttpStatus.BAD_GATEWAY);
      }

      return content;
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(`Failed to connect to Groq AI service: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async explainError(dto: AiExplainErrorRequest): Promise<AiExplainErrorResponse> {
    const systemPrompt = `You are DevKit AI Error Explainer. Analyze the provided error log or stack trace and return raw valid JSON object with EXACT keys:
"cause": concise summary of root cause
"explanation": step by step breakdown of why this error happened
"likelyFix": actionable steps to fix it
"codeExample": optional code block demonstrating fix`;

    const userPrompt = `Context: ${dto.context || 'General'}\nError:\n${dto.errorText}`;
    const rawJson = await this.callGroq(systemPrompt, userPrompt);
    return JSON.parse(rawJson) as AiExplainErrorResponse;
  }

  async generateRegex(dto: AiGenerateRegexRequest): Promise<AiGenerateRegexResponse> {
    const systemPrompt = `You are DevKit AI Regex Generator. Convert natural language user requirements into regular expressions. Return a valid JSON object with EXACT keys:
"pattern": string pattern without surrounding slashes (e.g. "[a-z0-9]+")
"flags": regex flags string (e.g. "g" or "gi" or "m")
"explanation": explanation of pattern components
"testExamples": array of 3 sample strings that match this regex`;

    const userPrompt = `Generate regex for requirement: ${dto.prompt}`;
    const rawJson = await this.callGroq(systemPrompt, userPrompt);
    return JSON.parse(rawJson) as AiGenerateRegexResponse;
  }

  async generateSql(dto: AiGenerateSqlRequest): Promise<AiGenerateSqlResponse> {
    const dialect = dto.dialect || 'postgres';
    const systemPrompt = `You are DevKit AI SQL Generator. Convert natural language database requests into clean, formatted ${dialect} SQL queries. Return a valid JSON object with EXACT keys:
"sql": clean, beautified SQL query
"explanation": explanation of tables, joins, filters, and optimization logic used`;

    const userPrompt = `Dialect: ${dialect}\nRequirement: ${dto.prompt}`;
    const rawJson = await this.callGroq(systemPrompt, userPrompt);
    return JSON.parse(rawJson) as AiGenerateSqlResponse;
  }

  async convertJson(dto: AiConvertJsonRequest): Promise<AiConvertJsonResponse> {
    const systemPrompt = `You are DevKit AI JSON Converter. Convert JSON strings into ${dto.targetLanguage} types/schemas/classes. Return a valid JSON object with EXACT keys:
"code": exact code block representation
"explanation": brief notes on generated types`;

    const userPrompt = `Target Language: ${dto.targetLanguage}\nJSON Content:\n${dto.jsonString}`;
    const rawJson = await this.callGroq(systemPrompt, userPrompt);
    return JSON.parse(rawJson) as AiConvertJsonResponse;
  }

  async explainCode(dto: AiExplainCodeRequest): Promise<AiExplainCodeResponse> {
    const systemPrompt = `You are DevKit AI Code Explainer. Analyze code snippets for logic, flow, and potential bugs. Return a valid JSON object with EXACT keys:
"explanation": high level summary of what code does
"flow": array of strings describing step by step execution
"potentialIssues": array of strings detailing edge cases, bugs, or security/performance risks`;

    const userPrompt = `Language: ${dto.language || 'auto'}\nCode:\n${dto.code}`;
    const rawJson = await this.callGroq(systemPrompt, userPrompt);
    return JSON.parse(rawJson) as AiExplainCodeResponse;
  }
}
