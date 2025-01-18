import { NextFunction } from 'express';

import { RequestWithBody } from 'src/types/request';
import { ProductDTO } from 'src/types/store';
import achievementService from '@services/achievementService';
import { ApiError } from '@ApiError';
import subscriptionService from '@services/subscribtionService';
import categoryService from '@services/store/categoryService';

export const productMiddleware = async (
    req: RequestWithBody<ProductDTO>,
    res: Response,
    next: NextFunction
) => {
    try {
        let {
            requiredAchievementId,
            requiredSubscriptionId,
            seasonStartDate,
            seasonEndDate
        } = req.body;

        // валидация id достижения
        if (requiredAchievementId) {
            await achievementService.getAchievementById(requiredAchievementId);
        }

        // валидация id подписки
        if (requiredSubscriptionId) {
            await subscriptionService.getSubscriptionById(
                requiredSubscriptionId
            );
        }

        // валидация даты начала и окончания
        if (seasonStartDate || seasonEndDate) {
            const currentDate = new Date();
            const moscowOffset = 3 * 60 * 60 * 1000;

            if (!seasonEndDate) {
                throw ApiError.badRequest('Не указана дата окончания');
            }

            if (!seasonStartDate) {
                seasonStartDate = new Date(
                    Date.UTC(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        currentDate.getDate()
                    ) - moscowOffset
                );
            } else {
                seasonStartDate = new Date(seasonStartDate);

                seasonStartDate = new Date(
                    Date.UTC(
                        seasonStartDate.getFullYear(),
                        seasonStartDate.getMonth(),
                        seasonStartDate.getDate()
                    ) - moscowOffset
                );
            }

            seasonEndDate = new Date(seasonEndDate);

            seasonEndDate = new Date(
                Date.UTC(
                    seasonEndDate.getFullYear(),
                    seasonEndDate.getMonth(),
                    seasonEndDate.getDate(),
                    23,
                    59,
                    59,
                    999
                ) - moscowOffset
            );

            if (
                seasonEndDate < seasonStartDate ||
                seasonEndDate < currentDate
            ) {
                throw ApiError.badRequest('Некорректная дата окончания');
            }

            req.body.seasonStartDate = seasonStartDate;
            req.body.seasonEndDate = seasonEndDate;
        }

        // валидация категорий
        if (req.body.categories.length > 0) {
            const uniqueCategoryIds = [...new Set(req.body.categories)];

            const isCategoryIdsValid =
                await categoryService.validateCategoryIds(uniqueCategoryIds);

            if (!isCategoryIdsValid) {
                throw ApiError.notFound(
                    'Некоторые из указанных категорий не существуют'
                );
            }

            req.body.categories = uniqueCategoryIds;
        }

        next();
    } catch (error) {
        next(error);
    }
};
