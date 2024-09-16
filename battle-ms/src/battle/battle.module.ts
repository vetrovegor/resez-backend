import { Module } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Battle } from './battle.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Battle])],
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
