import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { db, savedPipelines, eq, and, desc } from '../../database';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devkit_super_secret_jwt_key_development_2026';

function verifyToken(authHeader?: string): { sub: string; email: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Authentication required to access saved pipelines.');
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
  } catch {
    throw new UnauthorizedException('Invalid or expired session token.');
  }
}

@Controller('pipelines')
export class PipelinesController {
  @Get()
  async getPipelines(@Headers('authorization') authHeader?: string) {
    const user = verifyToken(authHeader);

    const rows = await db
      .select()
      .from(savedPipelines)
      .where(eq(savedPipelines.userId, user.sub))
      .orderBy(desc(savedPipelines.createdAt));

    return { success: true, data: rows };
  }

  @Post()
  async savePipeline(
    @Headers('authorization') authHeader: string | undefined,
    @Body()
    body: {
      id?: string;
      name: string;
      description?: string;
      initialInput?: string;
      steps: any[];
    },
  ) {
    const user = verifyToken(authHeader);

    if (!body.name || !body.name.trim()) {
      throw new BadRequestException('Pipeline name is required');
    }
    if (!Array.isArray(body.steps) || body.steps.length === 0) {
      throw new BadRequestException('Pipeline must contain at least 1 step');
    }

    const pipelineId = body.id || `pipeline-${Date.now()}`;

    // Check if pipeline exists for user
    const existing = await db
      .select()
      .from(savedPipelines)
      .where(and(eq(savedPipelines.id, pipelineId), eq(savedPipelines.userId, user.sub)));

    if (existing.length > 0) {
      await db
        .update(savedPipelines)
        .set({
          name: body.name.trim(),
          description: body.description || null,
          initialInput: body.initialInput || null,
          steps: body.steps,
          updatedAt: new Date(),
        })
        .where(and(eq(savedPipelines.id, pipelineId), eq(savedPipelines.userId, user.sub)));
    } else {
      await db.insert(savedPipelines).values({
        id: pipelineId,
        userId: user.sub,
        name: body.name.trim(),
        description: body.description || null,
        initialInput: body.initialInput || null,
        steps: body.steps,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return { success: true, data: { id: pipelineId, name: body.name } };
  }

  @Delete(':id')
  async deletePipeline(
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    const user = verifyToken(authHeader);

    const deleted = await db
      .delete(savedPipelines)
      .where(and(eq(savedPipelines.id, id), eq(savedPipelines.userId, user.sub)))
      .returning();

    if (deleted.length === 0) {
      throw new NotFoundException('Pipeline not found or not owned by user');
    }

    return { success: true, message: 'Pipeline deleted successfully' };
  }
}
