import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get(['/', 'api'])
  getRoot() {
    return {
      status: 'ok',
      service: 'DevKit API Server',
      version: '1.0.0',
      message: '🚀 DevKit Developer Productivity Hub API is running live!',
      documentation: 'https://github.com/Justdhif/devkit-tools',
      timestamp: new Date().toISOString(),
    };
  }
}
