import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Battle } from './battle.entity';
import { Repository } from 'typeorm';
import { BattleDto } from './dto/battle.dto';
import {
    OnGatewayConnection,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import 'dotenv/config';

@WebSocketGateway({
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(',')
    }
})
@Injectable()
export class BattleService implements OnGatewayConnection {
    constructor(
        @InjectRepository(Battle)
        private readonly battleRepository: Repository<Battle>
    ) {}

    @WebSocketServer() server: Server;

    async handleConnection(socket: Socket) {
        console.log('Connected client:', socket.id);

        // const socketId = socket.id;
        const battleId = socket.handshake.query.battle_id;

        console.log({ battleId });

        if (!battleId || isNaN(Number(battleId))) {
            console.log('Некорректное значение battleId');
            socket.emit('empty_battle_id', {
                message: 'Некорректное значение battleId'
            });
            socket.disconnect();
            return;
        }

        const exitedBattle = await this.battleRepository.findOne({
            where: { id: Number(battleId) }
        });

        if (!exitedBattle) {
            console.log(`Битва ${battleId} не найдена`);
            socket.emit('empty_battle_id', {
                message: `Битва ${battleId} не найдена`
            });
            socket.disconnect();
            return;
        }

        const clientsInRoom = await this.server.in(battleId).fetchSockets();

        console.log({ clientsCount: clientsInRoom.length });

        if (clientsInRoom.length + 1 > exitedBattle.playersCount) {
            console.log(`Битва ${battleId} переполнена`);
            socket.emit('battle_full', {
                message: `Битва ${battleId} переполнена`
            });
            socket.disconnect();
            return;
        }

        socket.join(battleId);

        socket.emit('battle_connected', {
            message: `Вы подключены к битве ${battleId}`
        });
    }

    async create(dto: BattleDto, creatorId: number) {
        return await this.battleRepository.save({
            ...dto,
            creatorId
        });
    }
}
