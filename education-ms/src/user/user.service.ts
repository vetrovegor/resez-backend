import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMqService } from '@rabbit-mq/rabbit-mq.service';
import { AchievementTypes } from './enums';

@Injectable()
export class UserService {
    constructor(
        private readonly rabbitMqService: RabbitMqService,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy
    ) {}

    async getById(userId: number) {
        return await this.rabbitMqService.sendRequest({
            client: this.userClient,
            pattern: 'preview',
            data: userId
        });
    }

    // TODO: achievementType должен быть перечислением
    async checkAchievementCompletion(
        userId: number,
        achievementType: AchievementTypes,
        value: number
    ) {
        return await this.rabbitMqService.sendRequest({
            client: this.userClient,
            pattern: 'check-achievement',
            data: {
                userId,
                achievementType,
                value
            }
        });
    }
}
