import {
    OnGatewayConnection,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import 'dotenv/config';
import { AuthUser, EmitTypes, EventTypes, User } from './constants';
import { ActivityService } from 'src/activity/activity.service';

@WebSocketGateway({
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(',')
    }
})
export class SocketService implements OnGatewayConnection {
    private users: User[] = [];
    private authUsers: AuthUser[] = [];

    constructor(private readonly activityService: ActivityService) {}

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

        this.logUsers();

        socket.on(EventTypes.Join, (userId: string, sessionId: string) =>
            this.handleJoinEvent(userId, sessionId, socketId)
        );

        socket.on(EventTypes.Leave, () => {
            this.disconnectAuthUser(socketId);
        });

        socket.on(EventTypes.Disconnect, async () =>
            this.disconnectUser(socketId)
        );
    }

    private async handleJoinEvent(
        userId: string,
        sessionId: string,
        socketId: string
    ) {
        console.log('Joined client:', { userId, sessionId, socketId });
        userId = userId.toString();
        sessionId = sessionId.toString();

        const isExists = this.authUsers.some(u => u.sessionId == sessionId);

        if (!isExists) {
            await this.activityService.createLoginActivity(userId);

            this.authUsers.push({
                socketId,
                userId,
                sessionId
            });
        }

        this.logUsers();
    }

    private async disconnectUser(socketId: string) {
        console.log('Disconnected client:', socketId);
        // попробовать тут сделать удаление через filter
        const index = this.users.findIndex(user => user.socketId == socketId);

        if (index != -1) {
            this.users.splice(index, 1);
        }
        this.logUsers();

        await this.disconnectAuthUser(socketId);
    }

    private async disconnectAuthUser(socketId: string): Promise<void> {
        console.log('Disconnected auth client:', socketId);
        const index = this.authUsers.findIndex(
            user => user.socketId == socketId
        );

        if (index != -1) {
            const { userId } = this.authUsers[index];
            await this.activityService.createLogoutActivity(userId);

            this.authUsers.splice(index, 1);
        }
        this.logUsers();
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

    emitToUsers(userIds: number[], emitType: EmitTypes, data?: any) {
        const userIdSet = new Set(userIds.map(id => id.toString()));
        const targetUsers = this.authUsers.filter(user =>
            userIdSet.has(user.userId)
        );

        for (const user of targetUsers) {
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

    emitRoleUpdating(userIds: number[], action: string) {
        const socketIds = this.authUsers
            .filter(authUser => userIds.includes(Number(authUser.userId)))
            .map(authUser => authUser.socketId);
        for (const socketId of socketIds) {
            this.emitToRoom(socketId, EmitTypes.Refresh, action);
        }
    }

    emitGettingAchievement(data: { userId: number; achievement: any }) {
        this.emitToUser(data.userId, EmitTypes.Achievement, data.achievement);
    }

    async getUserActivity(userId: string) {
        const isOnline = this.authUsers.some(u => u.userId === userId);

        const lastSeen = await this.activityService.getLastActivityDate(userId);

        return { isOnline, lastSeen };
    }

    getOnlineUserIds(): number[] {
        return this.authUsers.map(user => Number(user.userId));
    }

    getOnline() {
        return this.users.length;
    }

    logUsers() {
        console.log({ users: this.users, authUsers: this.authUsers });
    }
}
