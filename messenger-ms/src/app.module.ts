import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { RabbitMqModule } from '@rabbit-mq/rabbit-mq.module';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        RabbitMqModule,
        ChatModule,
        MessageModule,
        UserModule
    ]
})
export class AppModule {}
