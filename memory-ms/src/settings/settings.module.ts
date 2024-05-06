import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from './settings.entiry';

@Module({
    imports: [TypeOrmModule.forFeature([Settings])],
    controllers: [SettingsController],
    providers: [SettingsService]
})
export class SettingsModule {}
