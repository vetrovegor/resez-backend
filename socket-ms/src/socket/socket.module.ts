import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketController } from './socket.controller';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
    imports: [ActivityModule],
    providers: [SocketService],
    controllers: [SocketController]
})
export class SocketModule {}
