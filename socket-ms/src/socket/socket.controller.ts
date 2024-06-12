import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
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

    @EventPattern('emit-new-permissions')
    emitNewPermissions(userIDs: number[], permissions: any) {
        this.socketService.emitNewPermissions(userIDs, permissions);
    }
}
