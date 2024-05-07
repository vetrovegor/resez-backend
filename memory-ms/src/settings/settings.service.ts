import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Settings } from './settings.entiry';
import { Repository } from 'typeorm';
import { SettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Settings)
        private readonly collectionRepository: Repository<Settings>
    ) {}

    async get(userId: number) {
        const settings = await this.collectionRepository.findOne({
            where: { userId }
        });

        if (!settings) {
            throw new NotFoundException('Настройки пользователя не найдены');
        }

        delete settings.userId;

        return { settings };
    }

    async update(userId: number, dto: SettingsDto) {
        const existedSettings = await this.collectionRepository.findOne({
            where: { userId }
        });

        if (!existedSettings) {
            throw new NotFoundException('Настройки пользователя не найдены');
        }

        await this.collectionRepository.update({ userId }, { ...dto });

        const updatedSettings = await this.collectionRepository.findOne({
            where: { userId }
        });

        delete updatedSettings.userId;

        return { settings: updatedSettings };
    }

    async create(userId: number) {
        const settings = this.collectionRepository.create({ userId });
        return await this.collectionRepository.save(settings);
    }
}
