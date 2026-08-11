import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ToolsController } from './modules/tools/tools.controller';
import { SharingController } from './modules/sharing/sharing.controller';
import { AuthController } from './modules/auth/auth.controller';
import { FavoritesController } from './modules/favorites/favorites.controller';
import { HistoryController } from './modules/history/history.controller';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [AppController, ToolsController, SharingController, AuthController, FavoritesController, HistoryController],
  providers: [],
})
export class AppModule {}
