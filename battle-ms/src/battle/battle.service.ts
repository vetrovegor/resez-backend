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
import { User, UserBattle } from './interfaces';
import { UserService } from '@user/user.service';

@WebSocketGateway({
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(',')
    }
})
@Injectable()
export class BattleService implements OnGatewayConnection, OnGatewayDisconnect {
    private connectedUsers: User[] = [];
    private usersBattles: UserBattle[] = [];

    constructor(
        @InjectRepository(Battle)
        private readonly battleRepository: Repository<Battle>,
        private readonly userService: UserService
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

        this.logUsers();

        socket.on(EventTypes.Join, (battleId: string) =>
            this.handleJoinEvent(socket, Number(battleId))
        );

        socket.on(EventTypes.Leave, () => this.handleLeaveEvent(socket));

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
            userBattle => userBattle.userId == connectedUser.id
        );

        if (userBattle) {
            this.usersBattles = this.usersBattles.filter(
                userBattle => userBattle.userId != connectedUser.id
            );

            const battleId = userBattle.battleId.toString();

            socket
                .to(battleId)
                .emit(EmitTypes.UserLeaved, { user: connectedUser });

            socket.leave(battleId);
        }

        this.logUsers();
    }

    private async handleJoinEvent(socket: Socket, battleId: number) {
        console.log('Joined client:', socket.id);

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
            userId: existedUser.id,
            battleId,
            isLeader: existedUser.id == existedBattle.creatorId,
            status: 'waiting'
        });

        socket.join(battleId.toString());

        const battleDto = this.createDto(existedBattle);

        this.emitToSocket(socket, EmitTypes.BattleJoined, {
            battle: battleDto
        });

        socket.to(battleId.toString()).emit(EmitTypes.UserJoined, {
            user: {
                ...existedUser,
                isLeader: existedUser.id == existedBattle.creatorId
            }
        });

        this.logUsers();
    }

    handleLeaveEvent(socket: Socket) {
        console.log('Leaved client:', socket.id);

        const existedUser = this.connectedUsers.find(
            user => user.socketId == socket.id
        );

        // вынести 1
        const userBattle = this.usersBattles.find(
            userBattle => userBattle.userId == existedUser.id
        );

        if (userBattle) {
            this.usersBattles = this.usersBattles.filter(
                userBattle => userBattle.userId != existedUser.id
            );

            const battleId = userBattle.battleId.toString();

            socket
                .to(battleId)
                .emit(EmitTypes.UserLeaved, { user: existedUser });

            socket.leave(battleId);
        }

        this.logUsers();
    }

    logUsers() {
        console.log({
            connectedUsers: this.connectedUsers,
            usersBattles: this.usersBattles
        });
    }

    async create(dto: BattleDto, creatorId: number) {
        return await this.battleRepository.save({
            ...dto,
            creatorId
        });
    }

    createDto(battle: Battle, usersLimit?: number) {
        const usersInBattle = this.usersBattles
            .filter(userBattle => userBattle.battleId === battle.id)
            .map(userBattle => userBattle.userId);

        let users = this.connectedUsers
            .filter(user => usersInBattle.includes(user.id))
            .map(user => ({
                ...user,
                isLeader: user.id === battle.creatorId
            }));

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
}
