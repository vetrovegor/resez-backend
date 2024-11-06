import { Module } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Battle } from './battle.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Battle]),
        ClientsModule.registerAsync([
            {
                name: 'MEMORY_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [`${configService.get('RMQ_URL')}`],
                        queue: 'memory-queue',
                        queueOptions: { durable: false }
                    }
                }),
                inject: [ConfigService]
            }
        ])
    ],
    controllers: [BattleController],
    providers: [
        BattleService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class BattleModule {}
