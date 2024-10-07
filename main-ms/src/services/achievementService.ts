import { Op } from 'sequelize';

import Achievement from '../db/models/achievement/Achievement';
import UserAchievement from '../db/models/achievement/UserAchievement';
import { Achievements } from '../enums/achievement';
import { ApiError } from '../ApiError';
import rmqService from './rmqService';
import userService from './userService';

const initialAchievements = [
    {
        achievement: Achievements.MOTHER_HACKER,
        icon: `иконка 1`,
        description: 'Зайдите на секретную страницу',
        xp: 100,
        coins: 100
    },
    {
        achievement: Achievements.TEST_1,
        icon: 'иконка 2',
        description: 'Решите 1 тест',
        xp: 50,
        coins: 70
    },
    {
        achievement: Achievements.TEST_5,
        icon: 'иконка 3',
        description: 'Решите 5 тестов',
        xp: 100,
        coins: 150
    }
];

class AchievementService {
    async initAchievements() {
        for (const {
            achievement,
            icon,
            description,
            xp,
            coins
        } of initialAchievements) {
            const existedAchievement = await Achievement.findOne({
                where: { achievement }
            });

            if (existedAchievement) {
                existedAchievement.set('icon', icon);
                existedAchievement.set('description', description);
                existedAchievement.set('xp', xp);
                existedAchievement.set('coins', coins);
                await existedAchievement.save();
            } else {
                await Achievement.create({
                    achievement,
                    icon,
                    description,
                    xp,
                    coins
                });
            }
        }

        return await Achievement.destroy({
            where: {
                achievement: {
                    [Op.notIn]: Object.values(Achievements)
                }
            }
        });
    }

    async getAchievements() {
        return await Achievement.findAll();
    }

    async getAchievementById(id: number) {
        const achievementData = await Achievement.findByPk(id);

        if (!achievementData) {
            throw ApiError.notFound('Достижение не найдено');
        }

        return achievementData;
    }

    async getAchievementByAchievement(achievement: string) {
        const achievementData = await Achievement.findOne({
            where: { achievement }
        });

        if (!achievementData) {
            throw ApiError.notFound('Достижение не найдено');
        }

        return achievementData;
    }

    async getSecretAchievement(userId: number) {
        const achievementData = await this.getAchievementByAchievement(
            Achievements.MOTHER_HACKER
        );

        const { id: achievementId, xp, coins } = achievementData.toJSON();

        const existedUserAchievement = await UserAchievement.findOne({
            where: {
                userId,
                achievementId
            }
        });

        if (existedUserAchievement) {
            throw ApiError.badRequest('Достижение уже получено');
        }

        await UserAchievement.create({
            userId,
            achievementId
        });

        await userService.rewardUser(userId, xp, coins);

        rmqService.sendToQueue('socket-queue', 'achievement', {
            userId,
            achievement: achievementData
        });
    }

    async getUserAchievements(userId: number) {
        const userAchievementData = await UserAchievement.findAll({
            where: { userId },
            include: [Achievement]
        });

        return userAchievementData.map(item => item.get('achievement'));
    }
}

export default new AchievementService();
