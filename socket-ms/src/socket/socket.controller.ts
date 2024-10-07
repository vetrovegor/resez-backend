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
        const { userId, emitType, data } = content;
        this.socketService.emitToUser(userId, emitType, data);
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

    @EventPattern('role-updated')
    emitRoleUpdating(@Payload() userIds: number[]) {
        this.socketService.emitRoleUpdating(userIds);
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
        this.socketService.emitGettingAchievement(data);
    }
}
