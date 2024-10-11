import { Op } from 'sequelize';

import Subscription from '../db/models/subscription/Subscription';
import { ApiError } from '../ApiError';
import userService from './userService';
import { getSubscriptionExpiredhDate } from '../utils';

const initialSubscriptions = [
    {
        subscription: 'ResEz Premium',
        canUploadImages: 'true',
        price: 99
    },
    {
        subscription: 'ResEz Premium Plus',
        canUploadImages: 'true',
        price: 379
    }
];

class SubscriptionService {
    async initSubscriptions() {
        for (const data of initialSubscriptions) {
            const existedSubscription = await Subscription.findOne({
                where: {
                    subscription: data.subscription
                }
            });

            if (!existedSubscription) {
                await Subscription.create({
                    ...data
                });
            } else {
                await existedSubscription.update({ ...data });
            }
        }

        return await Subscription.destroy({
            where: {
                subscription: {
                    [Op.notIn]: initialSubscriptions.map(
                        item => item.subscription
                    )
                }
            }
        });
    }

    async assignSubscription(
        subscriptionId: number,
        userId: number,
        expiredDate: Date,
        isPermanent: boolean
    ) {
        if (!isPermanent) {
            if (new Date(expiredDate) < new Date()) {
                throw ApiError.badRequest('Некорректный срок действия');
            }
        } else {
            expiredDate = null;
        }

        const existedSubscription = await Subscription.findByPk(subscriptionId);

        if (!existedSubscription) {
            throw ApiError.notFound('Подписка не найдена');
        }

        const existedUser = await userService.getUserById(userId);

        existedUser.set('subscriptionId', existedSubscription.get('id'));
        existedUser.set('subscriptionExpiredDate', expiredDate);
        existedUser.set('isSubscriptionPermanent', isPermanent);

        await existedUser.save();
    }

    async getSubscriptions() {
        return await Subscription.findAll();
    }

    async buySubscription(id: number, userId: number) {
        const subscription = await Subscription.findByPk(id);

        if (!subscription) {
            throw ApiError.notFound('Подписка не найдена');
        }

        const price = subscription.get('price');
        const user = await userService.getUserById(userId);
        const { subscriptionId, subscriptionExpiredDate, balance } =
            user.toJSON();

        if (subscriptionId == id && subscriptionExpiredDate > new Date()) {
            throw ApiError.badRequest('Подписка уже действует');
        }

        if (price > balance) {
            throw ApiError.badRequest('Недостаточно средств');
        }

        const expiredDate = getSubscriptionExpiredhDate(new Date());

        user.set('balance', balance - price);
        user.set('subscriptionId', id);
        user.set('subscriptionExpiredDate', expiredDate);

        await user.save();
    }
}

export default new SubscriptionService();
