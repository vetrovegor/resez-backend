import { Injectable, NotFoundException } from '@nestjs/common';
import { Log, LogType } from './log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '@user/user.service';

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(Log)
        private readonly logRepository: Repository<Log>,
        private readonly userService: UserService
    ) {}

    async create(
        type: LogType,
        userId: number,
        entityId: number,
        currentEntity: string,
        oldEntity?: string
    ) {
        return await this.logRepository.save({
            type,
            userId,
            entityId,
            currentEntity,
            oldEntity
        });
    }

    async find(take: number, skip: number, type: LogType) {
        const where = {
            ...(type != undefined && {
                type
            })
        };

        const [logsData, totalCount] = await this.logRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            take,
            skip
        });

        const logs = await Promise.all(
            logsData.map(async log => {
                delete log.currentEntity;
                delete log.oldEntity;

                const user = await this.userService.getById(log.userId);

                delete log.userId;

                return {
                    ...log,
                    user
                };
            })
        );

        return {
            logs,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: logsData.length
        };
    }

    async getById(id: number) {
        const logData = await this.logRepository.findOne({ where: { id } });

        if (!logData) {
            throw new NotFoundException('Лог не найден');
        }

        const user = await this.userService.getById(logData.userId);

        delete logData.userId;

        return {
            log: {
                ...logData,
                oldEntity: JSON.parse(logData.oldEntity),
                currentEntity: JSON.parse(logData.currentEntity),
                user
            }
        };
    }
}
