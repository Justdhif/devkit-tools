import { Controller, Get, Param, Query } from '@nestjs/common';
import { CORE_TOOLS, getToolBySlug, searchTools } from '@devkit/tool-core';

@Controller('tools')
export class ToolsController {
  @Get()
  getTools(@Query('q') q?: string) {
    if (q) {
      return { success: true, data: searchTools(q) };
    }
    return { success: true, data: CORE_TOOLS };
  }

  @Get(':slug')
  getTool(@Param('slug') slug: string) {
    const tool = getToolBySlug(slug);
    if (!tool) {
      return { success: false, error: 'Tool not found' };
    }
    return { success: true, data: tool };
  }
}
