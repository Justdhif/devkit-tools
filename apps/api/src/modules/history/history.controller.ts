import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Headers,
  UnauthorizedException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { db, toolHistory, eq, desc } from '../../database';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'devkit_super_secret_jwt_key_development_2026';

function verifyToken(authHeader?: string): { sub: string; email: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Authentication required to access history.');
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
  } catch {
    throw new UnauthorizedException('Invalid or expired session token.');
  }
}

@Controller('history')
export class HistoryController {
  @Get()
  async getHistory(
    @Headers('authorization') authHeader?: string,
    @Query('limit') limit?: string,
  ) {
    const user = verifyToken(authHeader);
    const take = Math.min(parseInt(limit || '50', 10), 100);

    const rows = await db
      .select()
      .from(toolHistory)
      .where(eq(toolHistory.userId, user.sub))
      .orderBy(desc(toolHistory.createdAt))
      .limit(take);

    return { success: true, data: rows };
  }



  @Post()
  async addHistory(
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: { toolSlug?: string; inputSummary?: string; isSensitive?: boolean },
  ) {
    const user = verifyToken(authHeader);
    const { toolSlug, inputSummary, isSensitive = false } = body;

    if (!toolSlug) {
      throw new BadRequestException('toolSlug is required');
    }

    const id = randomBytes(6).toString('hex');

    await db.insert(toolHistory).values({
      id,
      userId: user.sub,
      toolSlug,
      inputSummary: inputSummary?.slice(0, 200) ?? null,
      isSensitive,
    });

    return { success: true, data: { id } };
  }

  @Delete()
  async clearHistory(@Headers('authorization') authHeader?: string) {
    const user = verifyToken(authHeader);

    await db.delete(toolHistory).where(eq(toolHistory.userId, user.sub));

    return { success: true };
  }
}
