import { Module } from '@nestjs/common';
import { ToolsController } from './modules/tools/tools.controller';
import { SharingController } from './modules/sharing/sharing.controller';
import { AuthController } from './modules/auth/auth.controller';
import { FavoritesController } from './modules/favorites/favorites.controller';

@Module({
  imports: [],
  controllers: [ToolsController, SharingController, AuthController, FavoritesController],
  providers: [],
})
export class AppModule {}
