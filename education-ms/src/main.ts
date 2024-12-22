import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
        credentials: true,
        origin: configService.get('ALLOWED_ORIGINS').split(',')
    });

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [`${configService.get('RMQ_URL')}`],
            queue: 'education-queue',
            queueOptions: { durable: false }
        }
    });

    app.startAllMicroservices();

    const config = new DocumentBuilder()
        .setTitle('Education microservice')
        .setDescription('The education microservice API description')
        .setVersion('1.0')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, documentFactory);

    await app.listen(configService.get('PORT'));
}
bootstrap();
