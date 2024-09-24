import { PaginationDTO } from '../../dto/PaginationDTO';
import Theme from '../../db/models/store/theme/Theme';
import { ThemeDTO } from 'types/store';
import { ApiError } from '../../ApiError';
import UserTheme from '../../db/models/store/theme/UserTheme';
import userService from '../../services/userService';

class AvatarDecorationService {
    async createTheme({
        title,
        price,
        requiredSubscriptionId,
        achievementId,
        seasonStartDate,
        seasonEndDate,
        primary,
        light
    }: ThemeDTO) {
        return await Theme.create({
            title,
            price,
            requiredSubscriptionId,
            achievementId,
            seasonStartDate,
            seasonEndDate,
            primary,
            light
        });
    }

    async getThemes(limit: number, offset: number) {
        const themes = await Theme.findAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const totalCount = await Theme.count();

        return new PaginationDTO('products', themes, totalCount, limit, offset);
    }

    async getThemeById(id: number, isPublished?: boolean) {
        const where: { id: number; isPublished?: boolean } = { id };

        if (isPublished !== undefined) {
            where.isPublished = isPublished;
        }

        const theme = await Theme.findOne({ where });

        if (!theme) {
            throw ApiError.notFound('Тема не найдена');
        }

        return theme;
    }

    async togglePublishTheme(id: number) {
        const theme = await this.getThemeById(id);

        theme.set('isPublished', !theme.get('isPublished'));

        await theme.save();

        return theme;
    }

    async updateTheme(
        id: number,
        {
            title,
            price,
            requiredSubscriptionId,
            achievementId,
            seasonStartDate,
            seasonEndDate,
            primary,
            light
        }: ThemeDTO
    ) {
        const theme = await this.getThemeById(id);

        await Theme.update(
            {
                title,
                price,
                requiredSubscriptionId,
                achievementId,
                seasonStartDate,
                seasonEndDate,
                primary,
                light
            },
            { where: { id } }
        );

        return theme;
    }

    createUserThemeDto({
        theme,
        activeId,
        collectedIds = []
    }: {
        theme: Theme;
        activeId?: number;
        collectedIds?: number[];
    }) {
        theme = theme.toJSON();

        delete theme.isPublished;
        delete theme.isArchived;
        delete theme.createdAt;
        delete theme.updatedAt;

        return {
            ...theme,
            isActive: theme.id == activeId,
            isCollected: collectedIds.includes(theme.id),
            type: 'theme'
        };
    }

    async getPublishedThemes(limit: number, offset: number, userId: number) {
        const where = { isPublished: true };

        const themes = await Theme.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const collectedIds = (
            await UserTheme.findAll({
                where: { userId }
            })
        ).map(item => item.get('themeId'));

        const themeDTOs = themes.map(theme =>
            this.createUserThemeDto({
                theme,
                collectedIds
            })
        );

        const totalCount = await Theme.count({ where });

        return new PaginationDTO(
            'products',
            themeDTOs,
            totalCount,
            limit,
            offset
        );
    }

    async addThemeToUser(themeId: number, userId: number) {
        const theme = await this.getThemeById(themeId, true);

        const existingRecord = await UserTheme.findOne({
            where: {
                themeId,
                userId
            }
        });

        if (existingRecord) {
            throw ApiError.badRequest('Тема уже добавлена');
        }

        await userService.takePaymentForTheProduct({
            userId,
            price: theme.get('price')
        });

        await UserTheme.create({
            themeId,
            userId
        });

        return this.createUserThemeDto({ theme });
    }

    async getUserThemes(userId: number, limit: number, offset: number) {
        const { themeId: activeId } = (
            await userService.getUserById(userId)
        ).toJSON();

        const where = { userId };

        const userThemes = await UserTheme.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const themeDTOs = await Promise.all(
            userThemes.map(async item => {
                const theme = await this.getThemeById(item.get('themeId'));
                return this.createUserThemeDto({
                    theme,
                    activeId
                });
            })
        );

        const totalCount = await UserTheme.count({ where });

        return new PaginationDTO(
            'products',
            themeDTOs,
            totalCount,
            limit,
            offset
        );
    }

    async getUserTheme(themeId: number, userId: number) {
        const userTheme = await UserTheme.findOne({
            where: {
                themeId,
                userId
            }
        });

        if (!userTheme) {
            throw ApiError.notFound('Тема не найдена');
        }

        return userTheme;
    }
}

export default new AvatarDecorationService();
