import { Op } from 'sequelize';

import PromoCode from '../db/models/promo/PromoCode';
import UserPromocode from '../db/models/promo/UserPromoCode';
import { ApiError } from '../ApiError';
import userService from './userService';
import { PaginationDTO } from '../dto/PaginationDTO';
import { UserPromocodeUsage } from 'types/promoCode';

class PromoCodeService {
    async createPromoCode(
        code: string,
        expiredDate: string,
        limit: number,
        xp: number,
        coins: number,
        creatorId: number
    ) {
        const currentDate = new Date();

        if (expiredDate && new Date(expiredDate) < currentDate) {
            throw ApiError.badRequest('Некорректная дата истечения');
        }

        const existingPromocode = await PromoCode.findOne({
            where: {
                code,
                [Op.or]: [
                    { expiredDate: { [Op.gt]: currentDate } },
                    { expiredDate: null }
                ],
                isFinished: false
            }
        });

        if (existingPromocode) {
            throw ApiError.badRequest(
                'Существует активный промокод с таким названием'
            );
        }

        return await PromoCode.create({
            code,
            expiredDate,
            limit,
            xp,
            coins,
            creatorId
        });
    }

    async getPromoCodeById(id: number) {
        const promoCode = await PromoCode.findByPk(id);

        if (!promoCode) {
            throw ApiError.notFound('Промокод не найден');
        }

        // сделать short info
        return promoCode;
    }

    async activatePromoCode(code: string, userId: number) {
        const promoCode = await PromoCode.findOne({
            where: {
                code,
                isFinished: false,
                [Op.or]: [
                    { expiredDate: { [Op.gt]: new Date() } },
                    { expiredDate: null }
                ]
            },
            include: ['users']
        });

        if (!promoCode) {
            throw ApiError.notFound('Промокод недействителен или истек');
        }

        const { id, limit, xp, coins } = promoCode.get();
        const users = promoCode.get('users');

        if (limit && users.length >= limit) {
            throw ApiError.badRequest('Промокод недействителен или истек');
        }

        if (users.some(user => user.get('id') == userId)) {
            throw ApiError.badRequest('Промокод уже активирован');
        }

        await UserPromocode.create({
            userId,
            promoCodeId: id
        });

        await userService.rewardUser(userId, xp, coins);

        // сделать short info
        return promoCode;
    }

    async getUsersByPromocodeId(id: number, limit: number, offset: number) {
        await this.getPromoCodeById(id);

        const userPromocodeData = await UserPromocode.findAll({
            where: {
                promoCodeId: id
            },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const users = await Promise.all(
            userPromocodeData.map(async item => {
                const userData = await userService.getUserById(
                    item.get('userId')
                );
                const user = userData.toPreview();

                return {
                    ...user,
                    date: item.get('createdAt') as Date
                };
            })
        );

        const totalCount = await UserPromocode.count({
            where: {
                promoCodeId: id
            }
        });

        return new PaginationDTO<UserPromocodeUsage>(
            'users',
            users,
            totalCount,
            limit,
            offset
        );
    }
}

export default new PromoCodeService();
