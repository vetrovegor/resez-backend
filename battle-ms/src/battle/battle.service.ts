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

        this.usersBattles = this.usersBattles.filter(
            user => user.userId != connectedUser?.id
        );

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
            status: 'waiting'
        });

        const users = this.getUsersByBattleId(battleId);

        socket.join(battleId.toString());

        this.emitToSocket(socket, EmitTypes.BattleJoined, {
            battle: existedBattle,
            users
        });

        socket
            .to(battleId.toString())
            .emit(EmitTypes.UserJoined, { user: existedUser });

        this.logUsers();
    }

    private getUsersByBattleId(battleId: number) {
        const usersInBattle = this.usersBattles
            .filter(userBattle => userBattle.battleId === battleId)
            .map(userBattle => userBattle.userId);

        return this.connectedUsers.filter(user =>
            usersInBattle.includes(user.id)
        );
    }

    handleLeaveEvent(socket: Socket) {
        console.log('Leaved client:', socket.id);

        const existedUser = this.connectedUsers.find(
            user => user.socketId == socket.id
        );

        const userBattle = this.usersBattles.find(
            userBattle => userBattle.userId
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
}
