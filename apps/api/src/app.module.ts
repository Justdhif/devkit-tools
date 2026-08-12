import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { ToolsController } from './modules/tools/tools.controller';
import { SharingController } from './modules/sharing/sharing.controller';
import { AuthController } from './modules/auth/auth.controller';
import { FavoritesController } from './modules/favorites/favorites.controller';
import { HistoryController } from './modules/history/history.controller';
import { PipelinesController } from './modules/pipelines/pipelines.controller';
import { AiModule } from './modules/ai/ai.module';
import { AiRateLimitMiddleware } from './modules/ai/ai-rate-limit.middleware';

@Module({
  imports: [AiModule],
  controllers: [
    AppController,
    ToolsController,
    SharingController,
    AuthController,
    FavoritesController,
    HistoryController,
    PipelinesController,
  ],
  providers: [],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AiRateLimitMiddleware)
      .forRoutes({ path: 'ai/*', method: RequestMethod.POST });
  }
}
