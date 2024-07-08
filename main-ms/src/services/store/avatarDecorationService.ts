import { UploadedFile } from 'express-fileupload';

import fileService from '../../services/fileService';
import AvatarDecoration from '../../db/models/store/AvatarDecorations';
import { PaginationDTO } from '../../dto/PaginationDTO';

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
}

export default new AvatarDecorationService();
