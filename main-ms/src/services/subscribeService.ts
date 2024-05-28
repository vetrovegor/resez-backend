import { Op } from 'sequelize';

import Subscription from '../db/models/subscription/Subscription';
import { ApiError } from '../ApiError';
import userService from './userService';

const initialSubscriptions = [
    {
        subscription: 'ResEz Premium',
        canUploadImages: 'true'
    },
    {
        subscription: 'ResEz Premium Plus',
        canUploadImages: 'true'
    }
];

class SubscriptionService {
    async initSubscriptions() {
        for (const { subscription, canUploadImages } of initialSubscriptions) {
            const existedSubscription = await Subscription.findOne({
                where: {
                    subscription
                }
            });

            if (!existedSubscription) {
                await Subscription.create({
                    subscription,
                    canUploadImages
                });
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
        subscription: string,
        nickname: string,
        expiredDate: Date,
        isPermanent: boolean
    ) {
        const existedSubscription = await Subscription.findOne({
            where: { subscription }
        });

        if (!existedSubscription) {
            throw ApiError.notFound('Подписка не найдена');
        }

        const existedUser = await userService.getUserByNickname(nickname);

        existedUser.set('subscriptionId', existedSubscription.get('id'));
        existedUser.set('subscriptionExpiredDate', expiredDate);
        existedUser.set('isSubscriptionPermanent', isPermanent);

        await existedUser.save();
    }
}

export default new SubscriptionService();
