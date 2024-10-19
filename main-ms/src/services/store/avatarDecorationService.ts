import { UploadedFile } from 'express-fileupload';

import fileService from '../../services/fileService';
import AvatarDecoration from '../../db/models/store/avatarDecoration/AvatarDecoration';
import { PaginationDTO } from '../../dto/PaginationDTO';
import { ApiError } from '../../ApiError';
import UserAvatarDecoration from '../../db/models/store/avatarDecoration/UserAvatarDecoration';
import userService from '../../services/userService';

class AvatarDecorationService {
    createAvatarDecorationDto({
        avatarDecoration,
        activeId,
        collectedIds = []
    }: {
        avatarDecoration: AvatarDecoration;
        activeId?: number;
        collectedIds?: number[];
    }) {
        avatarDecoration = avatarDecoration.toJSON();

        delete avatarDecoration.requiredSubscriptionId;
        delete avatarDecoration.requiredAchievementId;

        const id = avatarDecoration.id;

        return {
            ...avatarDecoration,
            requiredSubscription: avatarDecoration.requiredSubscription ? {
                id: avatarDecoration.requiredSubscription.id,
                subscription: avatarDecoration.requiredSubscription.subscription
            }: null,
            requiredAchievement: avatarDecoration.requiredAchievement ? {
                id: avatarDecoration.requiredAchievement.id,
                type: avatarDecoration.requiredAchievement.type,
                achievement: avatarDecoration.requiredAchievement.achievement,
                icon: avatarDecoration.requiredAchievement.icon,
                description: avatarDecoration.requiredAchievement.description
            }: null,
            isActive: id == activeId,
            isCollected: collectedIds.includes(id),
            type: 'avatar_decoration',
            contentUrl: process.env.STATIC_URL + avatarDecoration.contentUrl,
            options: JSON.parse(avatarDecoration.options.toString())
        };
    }

    async createAvatarDecoration(
        title: string,
        contentType: string,
        price: number,
        seasonStartDate: Date,
        seasonEndDate: Date,
        requiredSubscriptionId: number,
        requiredAchievementId: number,
        options: string,
        content: UploadedFile
    ) {
        const contentUrl = await fileService.saveFile('store', content);

        const createdAvatarDecoration = await AvatarDecoration.create({
            title,
            contentType,
            price,
            seasonStartDate,
            seasonEndDate,
            requiredSubscriptionId,
            requiredAchievementId,
            options,
            contentUrl
        });

        return this.createAvatarDecorationDto({
            avatarDecoration: createdAvatarDecoration
        });
    }

    async getAvatarDecorations(limit: number, offset: number) {
        const avatarDecorations = await AvatarDecoration.findAll({
            include: ['requiredSubscription', 'requiredAchievement'],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const avatarDecorationDTOs = avatarDecorations.map(avatarDecoration =>
            this.createAvatarDecorationDto({ avatarDecoration })
        );

        const totalCount = await AvatarDecoration.count();

        return new PaginationDTO(
            'products',
            avatarDecorationDTOs,
            totalCount,
            limit,
            offset
        );
    }

    async getAvatarDecorationById(id: number, isPublished?: boolean) {
        const where: { id: number; isPublished?: boolean } = { id };

        if (isPublished !== undefined) {
            where.isPublished = isPublished;
        }

        const avatarDecoration = await AvatarDecoration.findOne({ where });

        if (!avatarDecoration) {
            this.throwAvatarDecorationNotFoundError();
        }

        return avatarDecoration;
    }

    async getUserAvatarDecoration(avatarDecorationId: number, userId: number) {
        const userAvatarDecoration = await UserAvatarDecoration.findOne({
            where: {
                avatarDecorationId,
                userId
            }
        });

        if (!userAvatarDecoration) {
            this.throwAvatarDecorationNotFoundError();
        }

        return userAvatarDecoration;
    }

    async togglePublishAvatarDecoration(id: number) {
        const avatarDecoration = await this.getAvatarDecorationById(id);

        avatarDecoration.set(
            'isPublished',
            !avatarDecoration.get('isPublished')
        );

        await avatarDecoration.save();

        return this.createAvatarDecorationDto({ avatarDecoration });
    }

    async getPublishedAvatarDecorations(
        limit: number,
        offset: number,
        userId: number
    ) {
        const where = { isPublished: true };

        const avatarDecorations = await AvatarDecoration.findAll({
            include: ['requiredSubscription', 'requiredAchievement'],
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const collectedIds = (
            await UserAvatarDecoration.findAll({
                where: { userId }
            })
        ).map(item => item.get('avatarDecorationId'));

        const avatarDecorationDTOs = avatarDecorations.map(avatarDecoration =>
            this.createAvatarDecorationDto({
                avatarDecoration,
                collectedIds
            })
        );

        const totalCount = await AvatarDecoration.count({ where });

        return new PaginationDTO(
            'products',
            avatarDecorationDTOs,
            totalCount,
            limit,
            offset
        );
    }

    async addAvatarDecorationToUser(
        avatarDecorationId: number,
        userId: number
    ) {
        const avatarDecoration = await this.getAvatarDecorationById(
            avatarDecorationId,
            true
        );

        const existingRecord = await UserAvatarDecoration.findOne({
            where: {
                avatarDecorationId,
                userId
            }
        });

        if (existingRecord) {
            throw ApiError.badRequest('Украшение уже добавлено');
        }

        await userService.takePaymentForTheProduct({
            userId,
            price: avatarDecoration.get('price')
        });

        await UserAvatarDecoration.create({
            avatarDecorationId,
            userId
        });

        return this.createAvatarDecorationDto({ avatarDecoration });
    }

    async getUserAvatarDecorations(
        userId: number,
        limit: number,
        offset: number
    ) {
        const { avatarDecorationId: activeId } = (
            await userService.getUserById(userId)
        ).toJSON();

        const where = { userId };

        const userAvatarDecorations = await UserAvatarDecoration.findAll({
            include: ['requiredSubscription', 'requiredAchievement'],
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const avatarDecorationDTOs = await Promise.all(
            userAvatarDecorations.map(async item => {
                const avatarDecoration = await this.getAvatarDecorationById(
                    item.get('avatarDecorationId')
                );
                return this.createAvatarDecorationDto({
                    avatarDecoration,
                    activeId
                });
            })
        );

        const totalCount = await UserAvatarDecoration.count({ where });

        return new PaginationDTO(
            'products',
            avatarDecorationDTOs,
            totalCount,
            limit,
            offset
        );
    }

    async createAvatarDecorationDtoById(id: number) {
        const avatarDecoration = await this.getAvatarDecorationById(id);
        return this.createAvatarDecorationDto({ avatarDecoration });
    }

    throwAvatarDecorationNotFoundError() {
        throw ApiError.notFound('Украшение аватара не найдено');
    }
}

export default new AvatarDecorationService();
