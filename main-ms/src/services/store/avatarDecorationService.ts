import { UploadedFile } from 'express-fileupload';

import fileService from '@services/fileService';
import AvatarDecoration from '@db/models/store/avatarDecoration/AvatarDecoration';
import { PaginationDTO } from '../../dto/PaginationDTO';
import { ApiError } from '@ApiError';
import UserAvatarDecoration from '@db/models/store/avatarDecoration/UserAvatarDecoration';
import userService from '@services/userService';
import categoryService from './categoryService';

class AvatarDecorationService {
    createAvatarDecorationDto({
        avatarDecoration,
        activeId,
        collectedIds = [],
        forAdmin = false
    }: {
        avatarDecoration: AvatarDecoration;
        activeId?: number;
        collectedIds?: number[];
        forAdmin?: boolean;
    }) {
        avatarDecoration = avatarDecoration.toJSON();

        const id = avatarDecoration.id;
        const usersCount = avatarDecoration?.userAvatarDecorations?.length;

        const categories = avatarDecoration.categories.map(category =>
            categoryService.createCategoryDto(category)
        );

        delete avatarDecoration.requiredSubscriptionId;
        delete avatarDecoration.requiredAchievementId;
        delete avatarDecoration.userAvatarDecorations;

        if (!forAdmin) {
            delete avatarDecoration.isPublished;
            delete avatarDecoration.createdAt;
            delete avatarDecoration.updatedAt;
        }

        return {
            ...avatarDecoration,
            isFree:
                !avatarDecoration.price &&
                !avatarDecoration.seasonStartDate &&
                !avatarDecoration.seasonEndDate &&
                !avatarDecoration.requiredSubscription &&
                !avatarDecoration.requiredAchievement,
            requiredSubscription: avatarDecoration.requiredSubscription
                ? {
                      id: avatarDecoration.requiredSubscription.id,
                      subscription:
                          avatarDecoration.requiredSubscription.subscription
                  }
                : null,
            requiredAchievement: avatarDecoration.requiredAchievement
                ? {
                      id: avatarDecoration.requiredAchievement.id,
                      type: avatarDecoration.requiredAchievement.type,
                      achievement:
                          avatarDecoration.requiredAchievement.achievement,
                      icon: avatarDecoration.requiredAchievement.icon,
                      description:
                          avatarDecoration.requiredAchievement.description
                  }
                : null,
            usersCount,
            isActive: id == activeId,
            isCollected: collectedIds.includes(id),
            type: 'avatar_decoration',
            contentUrl: process.env.STATIC_URL + avatarDecoration.contentUrl,
            options: JSON.parse(avatarDecoration.options.toString()),
            categories
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
        content: UploadedFile,
        categories: number[]
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

        await categoryService.createAvatarDecorationCategories(
            categories,
            createdAvatarDecoration.get('id')
        );

        return createdAvatarDecoration;
    }

    async getAvatarDecorations(limit: number, offset: number) {
        const avatarDecorations = await AvatarDecoration.findAll({
            include: [
                'requiredSubscription',
                'requiredAchievement',
                'userAvatarDecorations',
                'categories'
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const avatarDecorationDTOs = avatarDecorations.map(avatarDecoration =>
            this.createAvatarDecorationDto({ avatarDecoration, forAdmin: true })
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
            include: [
                'requiredSubscription',
                'requiredAchievement',
                'userAvatarDecorations',
                'categories'
            ],
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

    // TODO: придумать более корректное название
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
            price: avatarDecoration.get('price'),
            requiredSubscriptionId: avatarDecoration.get(
                'requiredSubscriptionId'
            ),
            requiredAchievementId: avatarDecoration.get(
                'requiredAchievementId'
            ),
            seasonStartDate: avatarDecoration.get('seasonStartDate'),
            seasonEndDate: avatarDecoration.get('seasonEndDate')
        });

        await UserAvatarDecoration.create({
            avatarDecorationId,
            userId
        });

        return this.createAvatarDecorationDto({ avatarDecoration });
    }

    async getAvatarDecorationDtoById(id: number, userId: number) {
        const avatarDecoration = await this.getAvatarDecorationById(id, true);

        const collectedIds = (
            await UserAvatarDecoration.findAll({
                where: { userId }
            })
        ).map(item => item.get('avatarDecorationId'));

        const { avatarDecorationId: activeId } = (
            await userService.getUserById(userId)
        ).toJSON();

        return this.createAvatarDecorationDto({
            avatarDecoration,
            activeId,
            collectedIds
        });
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
            include: [
                {
                    association: 'avatarDecoration',
                    include: [
                        'requiredSubscription',
                        'requiredAchievement',
                        'userAvatarDecorations',
                        'categories'
                    ]
                }
            ],
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const avatarDecorationDTOs = userAvatarDecorations.map(item => {
            return this.createAvatarDecorationDto({
                avatarDecoration: item.get('avatarDecoration'),
                activeId
            });
        });

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

    async deleteAvatarDecoration(id: number) {
        const avatarDecoration = await this.getAvatarDecorationById(id);
        await fileService.deleteFile(avatarDecoration.get('contentUrl'));
        // TODO: подумать как сделать на уровне бд чтобы при удалении становился null
        await userService.resetProductByProductId('avatarDecorationId', id);
        return await AvatarDecoration.destroy({ where: { id } });
    }

    throwAvatarDecorationNotFoundError() {
        throw ApiError.notFound('Украшение аватара не найдено');
    }
}

export default new AvatarDecorationService();
