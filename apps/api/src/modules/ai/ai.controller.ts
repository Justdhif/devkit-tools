import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import {
  AiExplainErrorRequest,
  AiGenerateRegexRequest,
  AiGenerateSqlRequest,
  AiConvertJsonRequest,
  AiExplainCodeRequest,
} from '@devkit/shared';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('explain-error')
  async explainError(@Body() body: AiExplainErrorRequest) {
    const data = await this.aiService.explainError(body);
    return { success: true, data };
  }

  @Post('generate-regex')
  async generateRegex(@Body() body: AiGenerateRegexRequest) {
    const data = await this.aiService.generateRegex(body);
    return { success: true, data };
  }

  @Post('generate-sql')
  async generateSql(@Body() body: AiGenerateSqlRequest) {
    const data = await this.aiService.generateSql(body);
    return { success: true, data };
  }

  @Post('convert-json')
  async convertJson(@Body() body: AiConvertJsonRequest) {
    const data = await this.aiService.convertJson(body);
    return { success: true, data };
  }

  @Post('explain-code')
  async explainCode(@Body() body: AiExplainCodeRequest) {
    const data = await this.aiService.explainCode(body);
    return { success: true, data };
  }
}
