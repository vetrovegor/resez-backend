import { Controller } from '@nestjs/common';
import {
    Ctx,
    EventPattern,
    MessagePattern,
    Payload,
    RmqContext
} from '@nestjs/microservices';
import { SocketService } from './socket.service';
import { EmitTypes } from './constants';

@Controller('socket')
export class SocketController {
    constructor(private readonly socketService: SocketService) {}

    @EventPattern('emit-to-user')
    emitToUser(content: { userId: number; emitType: EmitTypes; data: any }) {
        console.log({ event: 'emit-to-user', content });
        const { userId, emitType, data } = content;
        this.socketService.emitToUser(userId, emitType, data);
    }

    @EventPattern('emit-to-users')
    emitToUsers(content: {
        userIds: number[];
        emitType: EmitTypes;
        data: any;
    }) {
        console.log({ event: 'emit-to-users', content });
        const { userIds, emitType, data } = content;
        this.socketService.emitToUsers(userIds, emitType, data);
    }

    @EventPattern('emit-end-session')
    emitEndSession(sessionId: number) {
        this.socketService.emitEndSession(sessionId);
    }

    @EventPattern('emit-auth-code')
    emitAuthCode(content: { uniqueId: string; code: string }) {
        const { uniqueId, code } = content;
        this.socketService.emitAuthCode(uniqueId, code);
    }

    @EventPattern('refresh')
    emitRoleUpdating(
        @Payload() { userIds, action }: { userIds: number[]; action: string }
    ) {
        this.socketService.emitRoleUpdating(userIds, action);
    }

    @MessagePattern('online-users')
    getOnlineUserIds(@Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const onlineUserIds = this.socketService.getOnlineUserIds();
        channel.sendToQueue(
            originalMsg.properties.replyTo,
            Buffer.from(JSON.stringify(onlineUserIds))
        );
    }

    @MessagePattern('user-activity')
    async getUserActivity(@Payload() userId, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const { replyTo } = originalMsg.properties;
        const activity = await this.socketService.getUserActivity(
            userId.toString()
        );
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(activity)));
    }

    @MessagePattern('online')
    getOnline(@Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const { replyTo } = originalMsg.properties;
        const online = this.socketService.getOnline();
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(online)));
    }

    @EventPattern('achievement')
    emitGettingAchievement(
        @Payload() data: { userId: number; achievement: any }
    ) {
        console.log(
            `Пользователь ${data.userId} получил достижение ${data.achievement.achievement}`
        );
        this.socketService.emitGettingAchievement(data);
    }
}
