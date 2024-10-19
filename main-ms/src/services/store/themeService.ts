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
        requiredAchievementId,
        seasonStartDate,
        seasonEndDate,
        primary,
        light
    }: ThemeDTO) {
        return await Theme.create({
            title,
            price,
            requiredSubscriptionId,
            requiredAchievementId,
            seasonStartDate,
            seasonEndDate,
            primary,
            light
        });
    }

    createThemeDto({
        theme,
        activeId,
        collectedIds = []
    }: {
        theme: Theme;
        activeId?: number;
        collectedIds?: number[];
    }) {
        theme = theme.toJSON();

        delete theme.requiredSubscriptionId;
        delete theme.requiredAchievementId;

        const id = theme.id;

        return {
            ...theme,
            requiredSubscription: theme.requiredSubscription
                ? {
                      id: theme.requiredSubscription.id,
                      subscription: theme.requiredSubscription.subscription
                  }
                : null,
            requiredAchievement: theme.requiredAchievement
                ? {
                      id: theme.requiredAchievement.id,
                      type: theme.requiredAchievement.type,
                      achievement: theme.requiredAchievement.achievement,
                      icon: theme.requiredAchievement.icon,
                      description: theme.requiredAchievement.description
                  }
                : null,
            isActive: id == activeId,
            isCollected: collectedIds.includes(id),
            type: 'theme'
        };
    }

    async getThemes(limit: number, offset: number) {
        const themesData = await Theme.findAll({
            include: ['requiredSubscription', 'requiredAchievement'],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const themes = themesData.map(theme => this.createThemeDto({ theme }));

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
            requiredAchievementId,
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
                requiredAchievementId,
                seasonStartDate,
                seasonEndDate,
                primary,
                light
            },
            { where: { id } }
        );

        return theme;
    }

    async getPublishedThemes(limit: number, offset: number, userId: number) {
        const where = { isPublished: true };

        const themes = await Theme.findAll({
            include: ['requiredSubscription', 'requiredAchievement'],
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
            this.createThemeDto({
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

        return this.createThemeDto({ theme });
    }

    async getUserThemes(userId: number, limit: number, offset: number) {
        const { themeId: activeId } = (
            await userService.getUserById(userId)
        ).toJSON();

        const where = { userId };

        const userThemes = await UserTheme.findAll({
            include: [
                {
                    association: 'theme',
                    include: ['requiredSubscription', 'requiredAchievement']
                }
            ],
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        // TODO: сделать по нормальному (через include)
        const themeDTOs = await Promise.all(
            userThemes.map(async item => {
                const theme = item.get('theme').toJSON();
                console.log({ theme });
                return this.createThemeDto({
                    theme: item.get('theme'),
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
