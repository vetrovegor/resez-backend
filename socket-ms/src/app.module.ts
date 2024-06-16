import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from './socket/socket.module';
import { PrismaModule } from './prisma/prisma.module';
import { ActivityModule } from './activity/activity.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SocketModule,
        PrismaModule,
        ActivityModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
