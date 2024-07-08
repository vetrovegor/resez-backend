import { UploadedFile } from 'express-fileupload';

import fileService from '../../services/fileService';
import AvatarDecoration from '../../db/models/store/AvatarDecorations';
import { PaginationDTO } from '../../dto/PaginationDTO';
import { ApiError } from '../../ApiError';
import UserAvatarDecoration from '../../db/models/store/UserAvatarDecorations';

class AvatarDecorationService {
    createAvatarDecorationDto(avatarDecoration: AvatarDecoration) {
        return {
            ...avatarDecoration.toJSON(),
            type: 'avatar_decoration',
            contentUrl:
                process.env.STATIC_URL + avatarDecoration.get('contentUrl'),
            options: JSON.parse(avatarDecoration.get('options').toString())
        };
    }

    async createAvatarDecoration(
        title: string,
        contentType: string,
        price: number,
        seasonStartDate: Date,
        seasonEndDate: Date,
        achievementId: number,
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
            achievementId,
            options,
            contentUrl
        });

        return this.createAvatarDecorationDto(createdAvatarDecoration);
    }

    async getAvatarDecorations(limit: number, offset: number) {
        const avatarDecorations = await AvatarDecoration.findAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const avatarDecorationDTOs = avatarDecorations.map(avatarDecoration =>
            this.createAvatarDecorationDto(avatarDecoration)
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

    async getUserAvatarDecoration(
        avatarDecorationId: number,
        userId: number
    ) {
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

        return this.createAvatarDecorationDto(avatarDecoration);
    }

    async getPublishedAvatarDecorations(limit: number, offset: number) {
        const where = { isPublished: true };

        const avatarDecorations = await AvatarDecoration.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const avatarDecorationDTOs = avatarDecorations.map(avatarDecoration =>
            this.createAvatarDecorationDto(avatarDecoration)
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
            avatarDecorationId
        );

        const existingRecord = await UserAvatarDecoration.findOne({
            where: {
                avatarDecorationId,
                userId
            }
        });

        if (!existingRecord) {
            await UserAvatarDecoration.create({
                avatarDecorationId,
                userId
            });
        }

        return this.createAvatarDecorationDto(avatarDecoration);
    }

    async getUserAvatarDecorations(
        userId: number,
        limit: number,
        offset: number
    ) {
        const where = { userId };

        const userAvatarDecorations = await UserAvatarDecoration.findAll({
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
                return this.createAvatarDecorationDto(avatarDecoration);
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
        return this.createAvatarDecorationDto(avatarDecoration);
    }

    throwAvatarDecorationNotFoundError() {
        throw ApiError.notFound('Украшение аватара не найдено');
    }
}

export default new AvatarDecorationService();
