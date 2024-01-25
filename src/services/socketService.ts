import http from 'http';
import { Server, Socket } from "socket.io";

import { CORS_OPTIONS } from "../consts/CORS_OPTIONS";
import { EventTypes, ConnectedUser, AuthConnectedUser, EmitTypes } from 'types/socket';
import { PermissionDTO } from 'types/permission';

class SocketService {
    private io: Server;
    private connectedUsers: ConnectedUser[];
    private connectedAuthUsers: AuthConnectedUser[];

    init(server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
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

            socket.on(EventTypes.Join, async (userId: string, sessionId: string) => {
                userId = userId.toString();
                sessionId = sessionId.toString();

                const existedAuthUser = this.connectedAuthUsers.find(
                    u => u.userId == userId
                );

                if (!existedAuthUser) {
                    await socket.join(userId);

                    this.connectedAuthUsers.push({
                        socketId,
                        userId,
                        sessionId
                    });
                }
            });

            socket.on(EventTypes.Leave, (userId) => {
                socket.leave(userId);

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
                const index = this.connectedUsers.findIndex(
                    user => user.socketId == socketId
                );

                if (index != -1) {
                    this.connectedUsers.splice(index, 1);
                }

                await this.disconnectAuthUser(socketId);
            });
        })
    }

    async disconnectAuthUser(socketId: string): Promise<void> {
        const index = this.connectedAuthUsers.findIndex(
            user => user.socketId == socketId
        );

        if (index != -1) {
            // const { userId } = this.connectedAuthUsers[index];
            // await activityService.createUserLogoutActivity(userId);

            this.connectedAuthUsers.splice(index, 1);
        }
    }

    // в будущем может сделать чтобы передавался userId вместо room
    // и искался авторизованнный пользователь по userId
    // брался его socketId и в комнату socketId отправлялся emit
    // сделать два метода emitByUserId и emitBySessionId (или emitToUser, emitToSession)
    emitToRoom(room: string, emitType: EmitTypes, data?: any): void {
        this.io.to(room).emit(emitType, data);
    }

    // затестить и перейти на него
    // в emitEndSession сделать по аналогии
    emitByUserId(userId: number, emitType: EmitTypes, data?: any) {
        console.log({userId, emitType, data});
        const user = this.connectedAuthUsers.find(
            u => u.userId === userId.toString()
        );

        if (user) {
            this.io.to(user.socketId).emit(emitType, data);
        }
    }

    emitEndSession(sessionId: number): void {
        const user = this.connectedAuthUsers.find(
            u => u.sessionId === sessionId.toString()
        );

        if (user) {
            this.emitToRoom(user.userId, EmitTypes.EndSession);
        }
    }

    emitAuthCode(uniqueId: string, code: string) {
        const existedConnectedUser = this.connectedUsers.find(
            u => u.uniqueId === uniqueId
        );

        if (existedConnectedUser) {
            this.emitToRoom(
                existedConnectedUser.socketId,
                EmitTypes.Auth,
                { code }
            );
        }
    }

    emitNewPermissionsToUsers(userIDs: number[], permissions: PermissionDTO[]) {
        // сделать чтобы сначала отбирались те пользователи которые в сети в данный момент и уже им отправлялось
        userIDs.forEach(userId => {
            this.emitToRoom(
                userId.toString(),
                EmitTypes.NewPermissions,
                { permissions }
            );
        });
    }
}

export default new SocketService();