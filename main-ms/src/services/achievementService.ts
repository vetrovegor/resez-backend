import { Op } from 'sequelize';

import Achievement from '../db/models/achievement/Achievement';
import UserAchievement from '../db/models/achievement/UserAchievement';
import { AchievementNames, AchievementTypes } from '../enums/achievement';
import { ApiError } from '../ApiError';
import rmqService from './rmqService';
import userService from './userService';

const initialAchievements: {
    type: AchievementTypes;
    achievement: string;
    icon: string;
    description: string;
    targetValue: number;
    xp: number;
    coins: number;
}[] = [
    {
        type: AchievementTypes.SECRET,
        achievement: AchievementNames.MOTHER_HACKER,
        icon: process.env.STATIC_URL + 'achievements/mother-hacker.svg',
        description: 'Попытаться взломать админку (/wp-admin)',
        targetValue: 1,
        xp: 100,
        coins: 100
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_5,
        icon: process.env.STATIC_URL + 'achievements/lvl-5.svg',
        description: 'Достигнуть 5 уровня',
        targetValue: 5,
        xp: 100,
        coins: 100
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_10,
        icon: process.env.STATIC_URL + 'achievements/lvl-10.svg',
        description: 'Достигнуть 10 уровня',
        targetValue: 10,
        xp: 100,
        coins: 100
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_25,
        icon: process.env.STATIC_URL + 'achievements/lvl-25.svg',
        description: 'Достигнуть 25 уровня',
        targetValue: 25,
        xp: 100,
        coins: 100
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_50,
        icon: process.env.STATIC_URL + 'achievements/lvl-50.svg',
        description: 'Достигнуть 50 уровня',
        targetValue: 50,
        xp: 100,
        coins: 100
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_100,
        icon: process.env.STATIC_URL + 'achievements/lvl-10.svg',
        description: 'Достигнуть 100 уровня',
        targetValue: 100,
        xp: 100,
        coins: 100
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_500,
        icon: process.env.STATIC_URL + 'achievements/lvl-500.svg',
        description: 'Достигнуть 500 уровня',
        targetValue: 500,
        xp: 100,
        coins: 100
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_1000,
        icon: process.env.STATIC_URL + 'achievements/lvl-1000.svg',
        description: 'Достигнуть 1000 уровня',
        targetValue: 1000,
        xp: 100,
        coins: 100
    },
    {
        type: AchievementTypes.TEST,
        achievement: AchievementNames.TEST_1,
        icon: process.env.STATIC_URL + 'achievements/test-1.svg',
        description: 'Решите 1 тест',
        targetValue: 1,
        xp: 50,
        coins: 70
    },
    {
        type: AchievementTypes.TEST,
        achievement: AchievementNames.TEST_10,
        icon: process.env.STATIC_URL + 'achievements/test-10.svg',
        description: 'Решите 10 тестов',
        targetValue: 10,
        xp: 50,
        coins: 70
    },
    {
        type: AchievementTypes.TEST,
        achievement: AchievementNames.TEST_100,
        icon: process.env.STATIC_URL + 'achievements/test-100.svg',
        description: 'Решите 100 тестов',
        targetValue: 100,
        xp: 50,
        coins: 70
    },
    {
        type: AchievementTypes.TEST,
        achievement: AchievementNames.TEST_1000,
        icon: process.env.STATIC_URL + 'achievements/test-1000.svg',
        description: 'Решите 1000 тестов',
        targetValue: 1000,
        xp: 50,
        coins: 70
    }
];

class AchievementService {
    async initAchievements() {
        for (const {
            type,
            achievement,
            icon,
            description,
            targetValue,
            xp,
            coins
        } of initialAchievements) {
            const existedAchievement = await Achievement.findOne({
                where: { achievement }
            });

            if (existedAchievement) {
                existedAchievement.set('type', type);
                existedAchievement.set('icon', icon);
                existedAchievement.set('description', description);
                existedAchievement.set('targetValue', targetValue);
                existedAchievement.set('xp', xp);
                existedAchievement.set('coins', coins);
                await existedAchievement.save();
            } else {
                await Achievement.create({
                    achievement,
                    icon,
                    description,
                    targetValue,
                    xp,
                    coins
                });
            }
        }

        return await Achievement.destroy({
            where: {
                achievement: {
                    [Op.notIn]: Object.values(AchievementNames)
                }
            }
        });
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
            AchievementNames.MOTHER_HACKER
        );

        const { id: achievementId, xp, coins } = achievementData.toJSON();

        const existedUserAchievement = await UserAchievement.findOne({
            where: {
                userId,
                achievementId
            }
        });

        if (existedUserAchievement) {
            return;
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
        const achievementsData = await Achievement.findAll();

        const userAchievementData = await UserAchievement.findAll({
            where: { userId }
        });

        const modiifedAchievementsData = achievementsData.map(
            achievementData => {
                const {
                    id,
                    type,
                    achievement,
                    icon,
                    description,
                    targetValue,
                    xp,
                    coins
                } = achievementData.toJSON();

                const collectedData = userAchievementData.find(
                    item => item.get('achievementId') == id
                );

                const isSecret = type == AchievementTypes.SECRET;
                const isShowInfo = !isSecret || (isSecret && collectedData);

                return {
                    id,
                    type,
                    achievement: isShowInfo ? achievement : null,
                    icon: isShowInfo ? icon : null,
                    description: isShowInfo ? description : null,
                    targetValue,
                    xp: isShowInfo ? xp : null,
                    coins: isShowInfo ? coins : null,
                    isCollected: !!collectedData,
                    createdAt: collectedData ? collectedData.createdAt : null
                };
            }
        );

        const { level } = await userService.getUserLevelInfoById(userId);

        const testsCount = (await rmqService.sendToQueue(
            'education-queue',
            'tests-count',
            userId
        )) as number;

        const determineProgress = (
            achievement: Partial<Achievement> & { isCollected: boolean },
            value: number
        ) =>
            achievement.isCollected || value >= achievement.targetValue
                ? achievement.targetValue
                : value;

        return [
            {
                type: AchievementTypes.LVL,
                elements: modiifedAchievementsData
                    .filter(
                        achievement => achievement.type == AchievementTypes.LVL
                    )
                    .map(achievement => ({
                        ...achievement,
                        progress: determineProgress(achievement, level)
                    }))
            },
            {
                type: AchievementTypes.TEST,
                elements: modiifedAchievementsData
                    .filter(
                        achievement => achievement.type == AchievementTypes.TEST
                    )
                    .map(achievement => ({
                        ...achievement,
                        progress: determineProgress(achievement, testsCount)
                    }))
            },
            {
                type: AchievementTypes.SECRET,
                elements: modiifedAchievementsData
                    .filter(
                        achievement =>
                            achievement.type == AchievementTypes.SECRET
                    )
                    .map(achievement => ({
                        ...achievement,
                        progress: determineProgress(achievement, 0)
                    }))
            }
        ];
    }
}

export default new AchievementService();
