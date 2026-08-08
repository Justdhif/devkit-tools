import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 DevKit NestJS Backend running on http://localhost:${port}/api`);
}
bootstrap();
