import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { db, sharedItems, eq } from '../../database';

@Controller('share')
export class SharingController {
  @Post()
  async createShare(@Body() body: { toolSlug: string; title: string; configuration: Record<string, any> }) {
    const id = Math.random().toString(36).substring(2, 8);
    const safeConfig = { ...body.configuration };
    const sensitiveKeys = ['token', 'secret', 'password', 'key', 'jwt', 'auth', 'bearer'];
    for (const k of Object.keys(safeConfig)) {
      if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
        safeConfig[k] = '[REDACTED_BY_DEVKIT_SECURITY]';
      }
    }

    await db.insert(sharedItems).values({
      id,
      toolSlug: body.toolSlug,
      title: body.title || 'DevKit Shared Tool Config',
      configuration: safeConfig,
    });

    return {
      success: true,
      shareId: id,
      shareUrl: `/share/${id}`,
    };
  }

  @Get(':id')
  async getShare(@Param('id') id: string) {
    const records = await db.select().from(sharedItems).where(eq(sharedItems.id, id)).limit(1);
    if (!records || records.length === 0) {
      throw new NotFoundException('Shared item not found or expired');
    }
    return {
      success: true,
      data: records[0],
    };
  }
}
