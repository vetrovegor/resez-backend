import { Injectable } from '@nestjs/common';
import { Type } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivityService {
    constructor(private readonly prismaService: PrismaService) {}

    async createActivity(userId: string, type: Type) {
        return await this.prismaService.activity.create({
            data: { userId, type, date: new Date() }
        });
    }

    async createLoginActivity(userId: string) {
        return await this.createActivity(userId, Type.Login);
    }

    async createLogoutActivity(userId: string) {
        return await this.createActivity(userId, Type.Logout);
    }

    async getLastActivityDate(userId: string) {
        const data = await this.prismaService.activity.findFirst({
            where: { userId },
            orderBy: { date: 'desc' }
        });

        return data?.date ?? null;
    }

    async getActivityData(userId: string) {
        return await this.prismaService.activity.findMany({
            select: { id: true, type: true, date: true },
            where: { userId },
            orderBy: { date: 'desc' },
            take: 20
        });
    }
}
