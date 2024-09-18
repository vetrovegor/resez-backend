import { AuthModule } from '@auth/auth.module';
import { BattleModule } from '@battle/battle.module';
import { DatabaseModule } from '@database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMqModule } from '@rabbit-mq/rabbit-mq.module';
import { UserModule } from '@user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        AuthModule,
        BattleModule,
        RabbitMqModule,
        UserModule
    ]
})
export class AppModule {}
