import {
    OnGatewayConnection,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import 'dotenv/config';
import { AuthUser, EmitTypes, EventTypes, User } from './constants';

@WebSocketGateway({
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(',')
    }
})
export class SocketService implements OnGatewayConnection {
    private users: User[] = [];
    private authUsers: AuthUser[] = [];

    @WebSocketServer() server: Server;
    handleConnection(socket: Socket) {
        console.log('Connected client:', socket.id);

        const socketId = socket.id;
        const uniqueId = socket.handshake.auth.uniqueId;

        const isExists = this.users.some(u => u.uniqueId === uniqueId);

        if (!isExists) {
            this.users.push({
                socketId,
                uniqueId
            });
        }

        socket.on(EventTypes.Join, (userId: string, sessionId: string) =>
            this.handleJoinEvent(userId, sessionId, socketId)
        );

        socket.on(EventTypes.Leave, () => {
            this.disconnectAuthUser(socketId);
        });
    }

    private handleJoinEvent(
        userId: string,
        sessionId: string,
        socketId: string
    ) {
        userId = userId.toString();
        sessionId = sessionId.toString();

        const isExists = this.authUsers.some(u => u.sessionId == sessionId);

        if (!isExists) {
            // await activityService.createActivity(
            //     Number(userId),
            //     ActivityTypes.Login
            // );

            this.authUsers.push({
                socketId,
                userId,
                sessionId
            });
        }
    }

    private async disconnectAuthUser(socketId: string): Promise<void> {
        const index = this.authUsers.findIndex(
            user => user.socketId == socketId
        );

        if (index != -1) {
            // const { userId } = this.authUsers[index];
            // await activityService.createActivity(
            //     Number(userId),
            //     ActivityTypes.Logout
            // );

            this.authUsers.splice(index, 1);
        }
    }

    private emitToRoom(room: string, emitType: EmitTypes, data?: any): void {
        this.server.to(room).emit(emitType, data);
    }

    emitToUser(userId: number, emitType: EmitTypes, data?: any) {
        const users = this.authUsers.filter(
            u => u.userId === userId.toString()
        );

        for (const user of users) {
            this.emitToRoom(user.socketId, emitType, data);
        }
    }

    emitEndSession(sessionId: number): void {
        const user = this.authUsers.find(
            u => u.sessionId === sessionId.toString()
        );

        if (user) {
            this.emitToRoom(user.socketId, EmitTypes.EndSession);
        }
    }

    emitAuthCode(uniqueId: string, code: string) {
        const user = this.users.find(u => u.uniqueId === uniqueId);

        if (user) {
            this.emitToRoom(user.socketId, EmitTypes.Auth, { code });
        }
    }

    emitNewPermissions(userIDs: number[], permissions: any) {
        // сделать чтобы сначала отбирались те пользователи которые в сети в данный момент и уже им отправлялось
        userIDs.forEach(userId => {
            this.emitToRoom(userId.toString(), EmitTypes.NewPermissions, {
                permissions
            });
        });
    }

    getOnlineUserIDs(): number[] {
        return this.authUsers.map(user => Number(user.userId));
    }
}
