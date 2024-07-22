import { Injectable } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { Options } from './interfaces';

@Injectable()
export class RabbitMqService {
    async sendRequest({
        client,
        pattern,
        data,
        timeoutDuration = 1000,
        defaultValueOnError = null
    }: Options) {
        return await firstValueFrom(
            client.send(pattern, data).pipe(timeout(timeoutDuration))
        ).catch((error) => {
            console.log('Ошибка при отправке запроса rabbitMQ:', error.message);
            return defaultValueOnError;
        });
    }
}
