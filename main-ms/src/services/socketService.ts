import http from 'http';
import { Server, Socket } from 'socket.io';

import { CORS_OPTIONS } from '../consts/CORS_OPTIONS';
import {
    EventTypes,
    ConnectedUser,
    AuthConnectedUser,
    EmitTypes
} from 'types/socket';
import { PermissionDTO } from 'types/permission';
import activityService from './activityService';
import { ActivityTypes } from 'types/activity';

class SocketService {
    private io: Server;
    private connectedUsers: ConnectedUser[];
    private connectedAuthUsers: AuthConnectedUser[];

    init(
        server: http.Server<
            typeof http.IncomingMessage,
            typeof http.ServerResponse
        >
    ) {
        this.io = new Server(server, {
            cors: { ...CORS_OPTIONS }
        });

        this.connectedUsers = [];
        this.connectedAuthUsers = [];

        this.io.on('connection', (socket: Socket) => {
            const socketId = socket.id;
            const uniqueId = socket.handshake.auth.uniqueId;

            const existedConnectedUser = this.connectedUsers.find(
                u => u.uniqueId === uniqueId
            );

            if (!existedConnectedUser) {
                this.connectedUsers.push({
                    socketId,
                    uniqueId
                });
            }

            socket.on(
                EventTypes.Join,
                async (userId: string, sessionId: string) => {
                    userId = userId.toString();
                    sessionId = sessionId.toString();

                    const existedAuthUser = this.connectedAuthUsers.find(
                        u => u.sessionId == sessionId
                    );

                    if (!existedAuthUser) {
                        await activityService.createActivity(
                            Number(userId),
                            ActivityTypes.Login
                        );

                        this.connectedAuthUsers.push({
                            socketId,
                            userId,
                            sessionId
                        });
                    }
                }
            );

            socket.on(EventTypes.Leave, () => {
                this.disconnectAuthUser(socketId);
            });

            // socket.on(EventTypes.Stats, async () => {
            //     await this.emitStats(socket);

            //     const intervalId = setInterval(async () => {
            //         const index = this.connectedAuthUsers.findIndex(user => user.socketId == socketId);

            //         if (index == -1) {
            //             clearInterval(intervalId);
            //         }

            //         await this.emitStats(socket);
            //     }, 5000);
            // });

            socket.on(EventTypes.Disconnect, async () => {
                // попробовать тут сделать удаление через filter
                const index = this.connectedUsers.findIndex(
                    user => user.socketId == socketId
                );

                if (index != -1) {
                    this.connectedUsers.splice(index, 1);
                }

                await this.disconnectAuthUser(socketId);
            });
        });
    }

    async disconnectAuthUser(socketId: string): Promise<void> {
        const index = this.connectedAuthUsers.findIndex(
            user => user.socketId == socketId
        );

        if (index != -1) {
            const { userId } = this.connectedAuthUsers[index];
            await activityService.createActivity(
                Number(userId),
                ActivityTypes.Logout
            );

            this.connectedAuthUsers.splice(index, 1);
        }
    }

    private emitToRoom(room: string, emitType: EmitTypes, data?: any): void {
        this.io.to(room).emit(emitType, data);
    }

    emitByUserId(userId: number, emitType: EmitTypes, data?: any) {
        const users = this.connectedAuthUsers.filter(
            u => u.userId === userId.toString()
        );

        for (const user of users) {
            this.emitToRoom(user.socketId, emitType, data);
        }
    }

    emitEndSession(sessionId: number): void {
        const users = this.connectedAuthUsers.filter(
            u => u.sessionId === sessionId.toString()
        );

        for (const user of users) {
            this.emitToRoom(user.socketId, EmitTypes.EndSession);
        }
    }

    emitAuthCode(uniqueId: string, code: string) {
        const user = this.connectedUsers.find(u => u.uniqueId === uniqueId);

        if (user) {
            this.emitToRoom(user.socketId, EmitTypes.Auth, { code });
        }
    }

    emitNewPermissions(userIDs: number[], permissions: PermissionDTO[]) {
        // сделать чтобы сначала отбирались те пользователи которые в сети в данный момент и уже им отправлялось
        userIDs.forEach(userId => {
            this.emitToRoom(userId.toString(), EmitTypes.NewPermissions, {
                permissions
            });
        });
    }

    getOnlineUserIDs(): number[] {
        return this.connectedAuthUsers.map(user => Number(user.userId));
    }
}

export default new SocketService();
