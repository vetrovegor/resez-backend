import { NextFunction } from 'express';

import { RequestWithBody } from 'types/request';
import { ProductDTO } from 'types/store';
import achievementService from '../../services/achievementService';
import { ApiError } from '../../ApiError';
import subscriptionService from '../../services/subscribtionService';

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

            if (seasonStartDate && !seasonEndDate) {
                throw ApiError.badRequest('Не указана дата окончания');
            }

            if (seasonEndDate && !seasonStartDate) {
                seasonStartDate = currentDate;
            }

            if (new Date(seasonStartDate) < currentDate) {
                throw ApiError.badRequest('Некорректная дата начала');
            }

            const difference =
                new Date(seasonEndDate).getTime() -
                new Date(seasonStartDate).getTime();

            if (difference < 60 * 60 * 1000) {
                throw ApiError.badRequest(
                    'Дата окончания должна быть больше даты начала более чем на час'
                );
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};
