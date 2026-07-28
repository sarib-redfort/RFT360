import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  AdminNavigationController,
  AdminSettingsController,
  PublicSettingsController,
} from './settings.controllers';

@Module({
  controllers: [PublicSettingsController, AdminSettingsController, AdminNavigationController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
