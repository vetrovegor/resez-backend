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
import { EmitTypes, EventTypes, User } from './constants';

@WebSocketGateway({
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(',')
    }
})
@Injectable()
export class BattleService implements OnGatewayConnection, OnGatewayDisconnect {
    private users: User[] = [];

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

        this.users.push({ socketId, userId: userId.toString() });

        this.logUsers();

        socket.on(EventTypes.Join, (battleId: string) =>
            this.handleJoinEvent(socket, battleId)
        );
    }

    logUsers() {
        console.log({ user: this.users });
    }

    async handleDisconnect(socket: Socket) {
        console.log('Disnnected client:', socket.id);
        this.users = this.users.filter(user => user.socketId != socket.id);
        this.logUsers();
    }

    private async handleJoinEvent(socket: Socket, battleId: string) {
        console.log('Joined client:', { socketId: socket.id });

        const existedUser = this.users.find(user => user.socketId == socket.id);

        if (!existedUser) {
            socket.emit(EmitTypes.UserNotFound, {
                message: 'Пользователь не найден'
            });
            socket.disconnect();
            return;
        }

        console.log({ battleId });

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

        this.server
            .to(battleId)
            .emit(
                EmitTypes.BattleJoined,
                `Вы получили это сообщение, т.к. вы успешно присоединились к битве ${battleId}`
            );
    }

    async create(dto: BattleDto, creatorId: number) {
        return await this.battleRepository.save({
            ...dto,
            creatorId
        });
    }
}
