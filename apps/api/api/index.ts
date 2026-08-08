import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response } from 'express';

let cachedServer: any;

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api', { exclude: ['/'] });
    app.enableCors({
      origin: true,
      credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(req: Request, res: Response) {
  const server = await bootstrapServer();
  return server(req, res);
}
