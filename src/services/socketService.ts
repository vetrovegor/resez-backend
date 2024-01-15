import http from 'http';
import { Server, Socket } from "socket.io";

import { CORS_OPTIONS } from "../consts/CORS_OPTIONS";
import { Events, ConnectedUser, AuthConnectedUser, Emits } from 'types/socket';
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

            const user = {
                socketId,
                uniqueId
            };

            const existedConnectedUser = this.connectedUsers.find(
                u => u.uniqueId === uniqueId
            );

            if (!existedConnectedUser) {
                this.connectedUsers.push(user);
            }

            socket.on(Events.Join, async (userId: string, sessionId: string) => {
                userId = userId.toString();
                sessionId = sessionId.toString();

                // попробовать в будущем socket.join([userId, sessionId]);
                await socket.join(userId);
                await socket.join(sessionId);

                const authUser = {
                    userId,
                    socketId
                };

                const existedAuthUser = this.connectedAuthUsers.find(
                    u => u.userId == userId
                );

                if (!existedAuthUser) {
                    this.connectedAuthUsers.push(authUser);
                }
            });

            socket.on(Events.Leave, (userId, sessionId) => {
                socket.leave(userId);
                socket.leave(sessionId);

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

            socket.on(Events.Disconnect, async () => {
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

    emitToRoom(room: string, event: Emits, data: any) {
        this.io.to(room).emit(event, data);
    }

    emitAuthCode(uniqueId: string, code: string) {
        const existedConnectedUser = this.connectedUsers.find(
            u => u.uniqueId === uniqueId
        );

        if (existedConnectedUser) {
            this.emitToRoom(
                existedConnectedUser.socketId,
                Emits.Auth,
                { code }
            );
        }
    }

    emitNewPermissionsToUsers(userIDs: number[], permissions: PermissionDTO[]) {
        // сделать чтобы сначала отбирались те пользователи которые в сети в данный момент и уже им отправлялось
        userIDs.forEach(userId => {
            this.emitToRoom(
                userId.toString(),
                Emits.NewPermissions,
                { permissions }
            );
        });
    }
}

export default new SocketService();