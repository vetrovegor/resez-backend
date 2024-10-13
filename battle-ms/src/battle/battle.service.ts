import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Battle } from './battle.entity';
import { Repository } from 'typeorm';
import { BattleDto } from './dto/battle.dto';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import 'dotenv/config';
import { EmitTypes, EventTypes } from './enums';
import { BattleDeleteTimeout, User, UserBattle } from './interfaces';
import { UserService } from '@user/user.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(',')
    }
})
@Injectable()
export class BattleService implements OnGatewayConnection, OnGatewayDisconnect {
    private connectedUsers: User[] = [];
    private usersBattles: UserBattle[] = [];
    private battleDeleteTimeouts: BattleDeleteTimeout[] = [];

    constructor(
        @InjectRepository(Battle)
        private readonly battleRepository: Repository<Battle>,
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) {}

    @WebSocketServer() server: Server;

    private emitToSocket(
        socket: Socket,
        emitType: EmitTypes,
        data?: any,
        disconnect: boolean = false
    ) {
        socket.emit(emitType, data);
        if (disconnect) {
            socket.disconnect();
        }
        return;
    }

    async handleConnection(socket: Socket) {
        console.log('Connected client:', socket.id);

        const socketId = socket.id;
        // заменить на auth потом
        const userId = Number(socket.handshake.query.user_id);

        if (!userId || isNaN(userId)) {
            return this.emitToSocket(
                socket,
                EmitTypes.UserNotFound,
                {
                    message: 'Пользователь не найден'
                },
                true
            );
        }

        const user = await this.userService.getById(Number(userId));

        if (!user) {
            return this.emitToSocket(
                socket,
                EmitTypes.UserNotFound,
                {
                    message: 'Пользователь не найден'
                },
                true
            );
        }

        this.connectedUsers.push({ socketId, ...user });

        this.logInfo();

        socket.on(EventTypes.Join, (battleId: string) =>
            this.handleJoinEvent(socket, Number(battleId))
        );

        socket.on(EventTypes.Leave, () => this.handleLeaveEvent(socket));

        socket.on(EventTypes.ToggleReady, () => this.toggleReadyEvent(socket));

        this.emitToSocket(socket, EmitTypes.Connected);
    }

    async handleDisconnect(socket: Socket) {
        const socketId = socket.id;

        console.log('Disnnected client:', socketId);

        const connectedUser = this.connectedUsers.find(
            user => user.socketId == socketId
        );

        this.connectedUsers = this.connectedUsers.filter(
            user => user.socketId != socketId
        );

        // вынести 1
        const userBattle = this.usersBattles.find(
            userBattle => userBattle.socketId == socketId
        );

        if (userBattle) {
            this.usersBattles = this.usersBattles.filter(
                userBattle => userBattle.socketId != socketId
            );

            const battleId = userBattle.battleId;

            socket
                .to(battleId.toString())
                .emit(EmitTypes.UserLeaved, { user: connectedUser });

            socket.leave(battleId.toString());

            if (this.usersBattles.length === 0) {
                const timeout = setTimeout(
                    () => {
                        this.battleDeleteTimeouts =
                            this.battleDeleteTimeouts.filter(
                                item => item.battleId != battleId
                            );
                        this.delete(battleId);
                    },
                    Number(this.configService.get('BATTLE_AUTO_DELETE_TIMEOUT'))
                );

                this.battleDeleteTimeouts.push({
                    battleId,
                    timeout
                });
            }
        }

        this.logInfo();
    }

    private async handleJoinEvent(socket: Socket, battleId: number) {
        const socketId = socket.id;

        console.log('Joined client:', socketId);

        const existedUser = this.connectedUsers.find(
            user => user.socketId == socket.id
        );

        if (!existedUser) {
            return this.emitToSocket(socket, EmitTypes.UserNotFound, {
                message: 'Пользователь не найден'
            });
        }

        if (!battleId || isNaN(battleId)) {
            return this.emitToSocket(socket, EmitTypes.BattleNotFound, {
                message: 'Битва не найдена'
            });
        }

        const existedBattle = await this.battleRepository.findOne({
            where: { id: Number(battleId) }
        });

        if (!existedBattle) {
            return this.emitToSocket(socket, EmitTypes.BattleNotFound, {
                message: 'Битва не найдена'
            });
        }

        // проверка что пользователь уже в батле
        const existedUserBattle = this.usersBattles.find(
            userBattle => userBattle.userId == existedUser.id
        );

        if (existedUserBattle) {
            return this.emitToSocket(socket, EmitTypes.AlreadyInBattle, {
                battle: existedBattle
            });
        }

        const playersCount = this.usersBattles.filter(
            userBattle => userBattle.battleId == battleId
        ).length;

        if (playersCount + 1 > existedBattle.playersCount) {
            return this.emitToSocket(socket, EmitTypes.BattleFull, {
                message: 'Битва переполнена'
            });
        }

        this.usersBattles.push({
            socketId,
            userId: existedUser.id,
            battleId,
            isLeader: existedUser.id == existedBattle.creatorId,
            isReady: false
        });

        socket.join(battleId.toString());

        const battleDto = this.createDto(existedBattle);

        this.emitToSocket(socket, EmitTypes.BattleJoined, {
            battle: battleDto
        });

        socket.to(battleId.toString()).emit(EmitTypes.UserJoined, {
            user: {
                ...existedUser,
                isLeader: existedUser.id == existedBattle.creatorId,
                isReady: false
            }
        });

        const battleDeleteTimeout = this.battleDeleteTimeouts.find(
            item => item.battleId === battleId
        );

        if (battleDeleteTimeout) {
            clearTimeout(battleDeleteTimeout.timeout);
            this.battleDeleteTimeouts = this.battleDeleteTimeouts.filter(
                item => item.battleId !== battleId
            );
        }

        this.logInfo();
    }

    handleLeaveEvent(socket: Socket) {
        const socketId = socket.id;

        console.log('Leaved client:', socketId);

        const connectedUser = this.connectedUsers.find(
            user => user.socketId == socket.id
        );

        // вынести 1
        const userBattle = this.usersBattles.find(
            userBattle => userBattle.socketId == socketId
        );

        if (userBattle) {
            this.usersBattles = this.usersBattles.filter(
                userBattle => userBattle.socketId != socketId
            );

            const battleId = userBattle.battleId;

            socket
                .to(battleId.toString())
                .emit(EmitTypes.UserLeaved, { user: connectedUser });

            socket.leave(battleId.toString());

            if (this.usersBattles.length === 0) {
                const timeout = setTimeout(
                    () => {
                        this.battleDeleteTimeouts =
                            this.battleDeleteTimeouts.filter(
                                item => item.battleId != battleId
                            );
                        this.delete(battleId);
                    },
                    Number(this.configService.get('BATTLE_AUTO_DELETE_TIMEOUT'))
                );

                this.battleDeleteTimeouts.push({
                    battleId,
                    timeout
                });
            }
        }

        this.logInfo();
    }

    toggleReadyEvent(socket: Socket) {
        const socketId = socket.id;

        console.log('Toggle-ready client:', socketId);

        const existedUserBattle = this.usersBattles.find(
            userBattle => userBattle.socketId == socketId
        );

        if (!existedUserBattle) {
            return;
        }

        existedUserBattle.isReady = !existedUserBattle.isReady;

        const user = this.connectedUsers.find(
            user => user.socketId == socketId
        );

        socket
            .to(existedUserBattle.battleId.toString())
            .emit(EmitTypes.UserToggleReady, {
                user: {
                    ...user,
                    isLeader: existedUserBattle.isLeader,
                    isReady: existedUserBattle.isReady
                }
            });
    }

    logInfo() {
        console.log({
            connectedUsers: this.connectedUsers,
            usersBattles: this.usersBattles,
            battleDeleteTimeouts: this.battleDeleteTimeouts.map(item => ({
                battleId: item.battleId
            }))
        });
    }

    async create(dto: BattleDto, creatorId: number) {
        return await this.battleRepository.save({
            ...dto,
            creatorId
        });
    }

    createDto(battle: Battle, usersLimit?: number) {
        let users = this.usersBattles
            .filter(userBattle => userBattle.battleId === battle.id)
            .map(userBattle =>
                this.connectedUsers.find(u => u.id === userBattle.userId)
            )
            .filter(user => user !== undefined)
            .map(user => {
                const { isReady } = this.usersBattles.find(
                    userBattle => userBattle.userId == user.id
                );
                return { ...user, isReady };
            });

        if (usersLimit) {
            users = users.slice(0, usersLimit);
        }

        delete battle.creatorId;

        return {
            ...battle,
            users
        };
    }

    async find() {
        const battlesData = await this.battleRepository.find({
            where: { isPrivate: false },
            order: {
                createdAt: 'DESC'
            },
            take: 9
        });

        return battlesData.map(battle => this.createDto(battle, 3));
    }

    async delete(battleId: number) {
        console.log(`Удаление комнаты ${battleId}`);
        this.logInfo();
    }
}
