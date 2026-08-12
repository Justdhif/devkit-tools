import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * In-memory rate limiter for AI endpoints.
 *
 * Strategy: sliding window per IP address.
 * Limit: 10 requests per 60 seconds per IP.
 *
 * Note: On Vercel serverless, each instance has its own memory.
 * This provides per-instance rate limiting. For global rate limiting
 * across all instances, a distributed store (Redis/Upstash) would be needed.
 * For a portfolio project, per-instance limiting is appropriate and sufficient.
 */

interface RateLimitEntry {
  timestamps: number[];
}

@Injectable()
export class AiRateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly WINDOW_MS = 60 * 1000; // 60 seconds
  private readonly MAX_REQUESTS = 10;

  // Periodic cleanup to prevent memory leak (every 5 minutes)
  constructor() {
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const ip = this.getClientIp(req);
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    let entry = this.store.get(ip);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(ip, entry);
    }

    // Remove timestamps outside the sliding window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    if (entry.timestamps.length >= this.MAX_REQUESTS) {
      const oldestInWindow = entry.timestamps[0];
      const retryAfterMs = Math.ceil((oldestInWindow + this.WINDOW_MS - now) / 1000);

      res.setHeader('X-RateLimit-Limit', String(this.MAX_REQUESTS));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('Retry-After', String(retryAfterMs));

      throw new HttpException(
        {
          message: `AI rate limit exceeded. Maximum ${this.MAX_REQUESTS} requests per minute. Please wait ${retryAfterMs} second(s) before retrying.`,
          error: 'Too Many Requests',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAfterSeconds: retryAfterMs,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    entry.timestamps.push(now);

    res.setHeader('X-RateLimit-Limit', String(this.MAX_REQUESTS));
    res.setHeader('X-RateLimit-Remaining', String(this.MAX_REQUESTS - entry.timestamps.length));

    next();
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
    }
    return req.socket?.remoteAddress || req.ip || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;
    for (const [ip, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
      if (entry.timestamps.length === 0) {
        this.store.delete(ip);
      }
    }
  }
}
