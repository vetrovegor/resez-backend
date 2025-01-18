import { Op } from 'sequelize';

import PromoCode from '@db/models/promo/PromoCode';
import UserPromocode from '@db/models/promo/UserPromoCode';
import { ApiError } from '@ApiError';
import userService from './userService';
import { PaginationDTO } from '../dto/PaginationDTO';
import { UserPromocodeUsage } from 'src/types/promoCode';

class PromoCodeService {
    async createDto(promocode: PromoCode) {
        promocode = promocode.toJSON();

        const creator = (
            await userService.getUserById(promocode.creatorId)
        ).toPreview();

        const activationsCount = promocode.users ? promocode.users.length : 0;

        delete promocode.users;
        delete promocode.creatorId;

        return {
            ...promocode,
            isFinished:
                promocode.expiredDate && promocode.expiredDate < new Date()
                    ? true
                    : promocode.isFinished,
            activationsCount,
            creator
        };
    }

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

        const createdPromocode = await PromoCode.create({
            code,
            expiredDate,
            limit,
            xp,
            coins,
            creatorId
        });

        return await this.createDto(createdPromocode);
    }

    async getPromoCodeById(id: number) {
        const promoCode = await PromoCode.findByPk(id, { include: ['users'] });

        if (!promoCode) {
            throw ApiError.notFound('Промокод не найден');
        }

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

        if (users.some(user => user.get('id') == userId)) {
            throw ApiError.badRequest('Промокод уже активирован');
        }

        await UserPromocode.create({
            userId,
            promoCodeId: id
        });

        if (limit && users.length + 1 >= limit) {
            promoCode.set('isFinished', true);
            await promoCode.save();
        }

        await userService.rewardUser(userId, xp, coins);

        return { xp, coins };
    }

    async getPromocodes(
        limit: number,
        offset: number,
        isActive: string = 'true'
    ) {
        const where =
            isActive.toLowerCase() == 'true'
                ? {
                      isFinished: false,
                      [Op.or]: [
                          { expiredDate: { [Op.gt]: new Date() } },
                          { expiredDate: null }
                      ]
                  }
                : {
                      [Op.or]: [
                          { isFinished: true },
                          { expiredDate: { [Op.lt]: new Date() } }
                      ]
                  };

        const promoCodesData = await PromoCode.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            include: ['users']
        });

        const promocodesDtos = await Promise.all(
            promoCodesData.map(
                async promoCode => await this.createDto(promoCode)
            )
        );

        const totalCount = await PromoCode.count({ where });

        return new PaginationDTO(
            'promoCodes',
            promocodesDtos,
            totalCount,
            limit,
            offset
        );
    }

    async getPromocodeDtoById(id: number) {
        const promoCode = await this.getPromoCodeById(id);
        return await this.createDto(promoCode);
    }

    async getUsersByPromocodeId(id: number, limit: number, offset: number) {
        // сделал двумя разными запросами, потому что проблематично получить пользователей с пагинацией через includes
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

    async finishPromocode(id: number) {
        const promoCode = await this.getPromoCodeById(id);

        promoCode.set('isFinished', true);

        const updatedPromoCode = await promoCode.save();

        return await this.createDto(updatedPromoCode);
    }
}

export default new PromoCodeService();
