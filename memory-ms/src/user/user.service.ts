import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMqService } from '@rabbit-mq/rabbit-mq.service';

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

    async getByNickname(nickname: string) {
        return await this.rabbitMqService.sendRequest({
            client: this.userClient,
            pattern: 'preview-by-nickname',
            data: nickname
        });
    }
}
