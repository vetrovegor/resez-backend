import { AuthModule } from '@auth/auth.module';
import { BattleModule } from '@battle/battle.module';
import { DatabaseModule } from '@database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        AuthModule,
        BattleModule
    ]
})
export class AppModule {}
