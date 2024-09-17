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
import { EmitTypes, EventTypes, User, UserBattle } from './constants';

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
        private readonly battleRepository: Repository<Battle>
    ) {}

    @WebSocketServer() server: Server;

    async handleConnection(socket: Socket) {
        console.log('Connected client:', socket.id);

        const socketId = socket.id;
        // заменить на auth потом
        const userId = socket.handshake.query.user_id;

        if (!userId) {
            socket.emit(EmitTypes.EmptyUserId, {
                message: 'Id пользователя не должно быть пустым'
            });
            socket.disconnect();
            return;
        }

        this.connectedUsers.push({ socketId, userId: userId.toString() });

        this.logUsers();

        socket.on(EventTypes.Join, (battleId: string) =>
            this.handleJoinEvent(socket, battleId)
        );

        socket.on(EventTypes.Leave, () => this.handleLeaveEvent(socket));
    }

    async handleDisconnect(socket: Socket) {
        const socketId = socket.id;

        console.log('Disnnected client:', socketId);

        const { userId } = this.connectedUsers.find(
            user => user.socketId == socketId
        );

        this.connectedUsers = this.connectedUsers.filter(
            user => user.socketId != socketId
        );

        this.usersBattles = this.usersBattles.filter(
            user => user.userId != userId
        );

        this.logUsers();
    }

    private async handleJoinEvent(socket: Socket, battleId: string) {
        console.log('Joined client:', socket.id);

        const existedUser = this.connectedUsers.find(
            user => user.socketId == socket.id
        );

        if (!existedUser) {
            socket.emit(EmitTypes.UserNotFound, {
                message: 'Пользователь не найден'
            });
            return;
        }

        // сделать проверку, чтобы пользователь не был уже подключен к какому-то батлу

        if (!battleId || isNaN(Number(battleId))) {
            socket.emit(EmitTypes.IncorrectBattleId, {
                message: 'Некорректное значение id битвы'
            });
            return;
        }

        const exitedBattle = await this.battleRepository.findOne({
            where: { id: Number(battleId) }
        });

        if (!exitedBattle) {
            socket.emit(EmitTypes.BattleNotFound, {
                message: 'Битва не найдена'
            });
            return;
        }

        const clientsInRoom = await this.server.in(battleId).fetchSockets();

        if (clientsInRoom.length + 1 > exitedBattle.playersCount) {
            socket.emit(EmitTypes.BattleFull, {
                message: 'Битва переполнена'
            });
            return;
        }

        socket.join(battleId);

        this.usersBattles.push({ userId: existedUser.userId, battleId });

        this.server
            .to(battleId)
            .emit(
                EmitTypes.BattleJoined,
                `Вы получили это сообщение, т.к. вы успешно присоединились к битве ${battleId}`
            );

        this.logUsers();
    }

    handleLeaveEvent(socket: Socket) {
        console.log('Leaved client:', socket.id);

        const existedUser = this.connectedUsers.find(
            user => user.socketId == socket.id
        );

        if (!existedUser) {
            socket.emit(EmitTypes.UserNotFound, {
                message: 'Пользователь не найден'
            });
            return;
        }

        this.usersBattles = this.usersBattles.filter(
            userBattle => userBattle.userId != existedUser.userId
        );

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
