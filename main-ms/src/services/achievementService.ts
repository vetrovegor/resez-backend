import { Op } from 'sequelize';

import Achievement from '@db/models/achievement/Achievement';
import UserAchievement from '@db/models/achievement/UserAchievement';
import { AchievementNames, AchievementTypes } from '@enums/achievement';
import { ApiError } from '@ApiError';
import rmqService from './rmqService';
import userService from './userService';
import { Queues } from '@enums/rmq';

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
        xp: 404,
        coins: 32
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_5,
        icon: process.env.STATIC_URL + 'achievements/lvl-5.svg',
        description: 'Достигнуть 5 уровня',
        targetValue: 5,
        xp: 50,
        coins: 5
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_10,
        icon: process.env.STATIC_URL + 'achievements/lvl-10.svg',
        description: 'Достигнуть 10 уровня',
        targetValue: 10,
        xp: 150,
        coins: 10
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_25,
        icon: process.env.STATIC_URL + 'achievements/lvl-25.svg',
        description: 'Достигнуть 25 уровня',
        targetValue: 25,
        xp: 500,
        coins: 20
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_50,
        icon: process.env.STATIC_URL + 'achievements/lvl-50.svg',
        description: 'Достигнуть 50 уровня',
        targetValue: 50,
        xp: 1500,
        coins: 30
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_100,
        icon: process.env.STATIC_URL + 'achievements/lvl-10.svg',
        description: 'Достигнуть 100 уровня',
        targetValue: 100,
        xp: 2500,
        coins: 40
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_500,
        icon: process.env.STATIC_URL + 'achievements/lvl-500.svg',
        description: 'Достигнуть 500 уровня',
        targetValue: 500,
        xp: 5000,
        coins: 50
    },
    {
        type: AchievementTypes.LVL,
        achievement: AchievementNames.LVL_1000,
        icon: process.env.STATIC_URL + 'achievements/lvl-1000.svg',
        description: 'Достигнуть 1000 уровня',
        targetValue: 1000,
        xp: 7500,
        coins: 100
    },
    {
        type: AchievementTypes.TEST,
        achievement: AchievementNames.TEST_1,
        icon: process.env.STATIC_URL + 'achievements/test-1.svg',
        description: 'Решите 1 тест',
        targetValue: 1,
        xp: 50,
        coins: 5
    },
    {
        type: AchievementTypes.TEST,
        achievement: AchievementNames.TEST_10,
        icon: process.env.STATIC_URL + 'achievements/test-10.svg',
        description: 'Решите 10 тестов',
        targetValue: 10,
        xp: 150,
        coins: 10
    },
    {
        type: AchievementTypes.TEST,
        achievement: AchievementNames.TEST_100,
        icon: process.env.STATIC_URL + 'achievements/test-100.svg',
        description: 'Решите 100 тестов',
        targetValue: 100,
        xp: 500,
        coins: 20
    },
    {
        type: AchievementTypes.TEST,
        achievement: AchievementNames.TEST_1000,
        icon: process.env.STATIC_URL + 'achievements/test-1000.svg',
        description: 'Решите 1000 тестов',
        targetValue: 1000,
        xp: 1000,
        coins: 30
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

        this.sendAchievementNotification(userId, achievementData);
    }

    getAchievementsByType<T extends Partial<Achievement>>(
        achievements: T[],
        type: AchievementTypes
    ) {
        return achievements.filter(achievement => achievement.type === type);
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
                const isShowInfo = !isSecret || collectedData;

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

        let testsCount = 0;

        for (const queue of [
            Queues.EducationEGE,
            Queues.EducationOGE,
            Queues.EducationENT
        ]) {
            const value = (await rmqService.sendToQueue(
                queue,
                'tests-count',
                userId
            )) as number;

            if (value) {
                testsCount += value;
            }
        }

        const determineProgress = (
            achievement: Partial<Achievement> & { isCollected: boolean },
            value: number
        ) =>
            achievement.isCollected || value >= achievement.targetValue
                ? achievement.targetValue
                : value;

        const getAchievementsByTypeWithProgress = (
            type: AchievementTypes,
            value: number
        ) =>
            this.getAchievementsByType(modiifedAchievementsData, type).map(
                achievement => ({
                    ...achievement,
                    progress: determineProgress(achievement, value)
                })
            );

        const lvlAchievements = getAchievementsByTypeWithProgress(
            AchievementTypes.LVL,
            level
        );
        const testAchievements = getAchievementsByTypeWithProgress(
            AchievementTypes.TEST,
            testsCount
        );
        const secretAchievements = getAchievementsByTypeWithProgress(
            AchievementTypes.SECRET,
            0
        );

        return {
            totalCount: modiifedAchievementsData.length,
            achievements: [
                {
                    type: AchievementTypes.LVL,
                    totalCount: lvlAchievements.length,
                    elements: lvlAchievements
                },
                {
                    type: AchievementTypes.TEST,
                    totalCount: testAchievements.length,
                    elements: testAchievements
                },
                {
                    type: AchievementTypes.SECRET,
                    totalCount: secretAchievements.length,
                    elements: secretAchievements
                }
            ]
        };
    }

    async getAchievementsForSelect() {
        const achievementData = await Achievement.findAll();

        const getShortAchievementsByType = (type: AchievementTypes) =>
            this.getAchievementsByType(
                achievementData.map(achievement => achievement.toJSON()),
                type
            ).map(({ id, achievement, icon, description }) => ({
                id,
                achievement,
                icon,
                description
            }));

        return [
            {
                type: AchievementTypes.LVL,
                elements: getShortAchievementsByType(AchievementTypes.LVL)
            },
            {
                type: AchievementTypes.TEST,
                elements: getShortAchievementsByType(AchievementTypes.TEST)
            },
            {
                type: AchievementTypes.SECRET,
                elements: getShortAchievementsByType(AchievementTypes.SECRET)
            }
        ];
    }

    async checkAchievementCompletion(
        userId: number,
        achievementType: AchievementTypes,
        value: number
    ) {
        const achievementsByType = await Achievement.findAll({
            where: { type: achievementType }
        });

        const userAchievementIds = (
            await UserAchievement.findAll({
                where: { userId }
            })
        ).map(item => item.get('achievementId'));

        for (const achievement of achievementsByType) {
            const {
                id: achievementId,
                targetValue,
                xp,
                coins
            } = achievement.toJSON();

            if (
                !userAchievementIds.includes(achievementId) &&
                value >= targetValue
            ) {
                await UserAchievement.create({
                    userId,
                    achievementId
                });

                await userService.rewardUser(userId, xp, coins);

                this.sendAchievementNotification(userId, achievement);
            }
        }
    }

    async sendAchievementNotification(
        userId: number,
        achievement: Achievement
    ) {
        rmqService.sendToQueue(Queues.Socket, 'achievement', {
            userId,
            achievement
        });
    }
}

export default new AchievementService();
