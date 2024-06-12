import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [`${configService.get('RMQ_URL')}`],
            queue: 'socket-queue',
            queueOptions: { durable: false }
        }
    });

    app.startAllMicroservices();

    await app.listen(configService.get('PORT'));
}
bootstrap();
