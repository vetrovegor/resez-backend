import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { MessagePattern } from '@nestjs/microservices';
import { CurrentUser } from '@auth/current-user.decorator';
import { JwtPayload } from '@auth/interfaces';
import { SettingsDto } from './dto/settings.dto';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get()
    async get(@CurrentUser() user: JwtPayload) {
        return await this.settingsService.get(user.id);
    }

    @Patch()
    async update(@CurrentUser() user: JwtPayload, @Body() dto: SettingsDto) {
        return await this.settingsService.update(user.id, dto);
    }

    @MessagePattern('create')
    async create(userId: number) {
        return await this.settingsService.create(userId);
    }
}
