import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class AiRateLimitMiddleware implements NestMiddleware {
    private readonly store;
    private readonly WINDOW_MS;
    private readonly MAX_REQUESTS;
    constructor();
    use(req: Request, res: Response, next: NextFunction): void;
    private getClientIp;
    private cleanup;
}
