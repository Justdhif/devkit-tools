import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { db, favorites, eq, and } from '../../database';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devkit_super_secret_jwt_key_development_2026';

function verifyToken(authHeader?: string): { sub: string; email: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Authentication required to access favorites.');
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
  } catch (err) {
    throw new UnauthorizedException('Invalid or expired session token.');
  }
}

@Controller('favorites')
export class FavoritesController {
  @Get()
  async getFavorites(@Headers('authorization') authHeader?: string) {
    const user = verifyToken(authHeader);
    const userFavs = await db
      .select({ toolSlug: favorites.toolSlug })
      .from(favorites)
      .where(eq(favorites.userId, user.sub));

    return {
      success: true,
      data: userFavs.map((f) => f.toolSlug),
    };
  }

  @Post('toggle')
  async toggleFavorite(
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: { toolSlug?: string }
  ) {
    const user = verifyToken(authHeader);
    const { toolSlug } = body;
    if (!toolSlug) {
      throw new BadRequestException('toolSlug is required');
    }

    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, user.sub), eq(favorites.toolSlug, toolSlug)))
      .limit(1);

    if (existing && existing.length > 0) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, user.sub), eq(favorites.toolSlug, toolSlug)));
    } else {
      await db.insert(favorites).values({
        userId: user.sub,
        toolSlug,
      });
    }

    const updated = await db
      .select({ toolSlug: favorites.toolSlug })
      .from(favorites)
      .where(eq(favorites.userId, user.sub));

    return {
      success: true,
      data: updated.map((f) => f.toolSlug),
    };
  }
}
