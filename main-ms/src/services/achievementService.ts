import { Op } from 'sequelize';

import Achievement from '../db/models/Achievement';
import { Achievements } from '../enums/achievement';
import { ApiError } from '../ApiError';

class AchievementService {
    async initAchievements() {
        const initialAchievements = Object.values(Achievements);

        initialAchievements.forEach(async achievement => {
            const existedAchievement = await Achievement.findOne({
                where: {
                    achievement
                }
            });

            if (!existedAchievement) {
                await Achievement.create({
                    achievement
                });
            }
        });

        return await Achievement.destroy({
            where: {
                achievement: {
                    [Op.notIn]: initialAchievements
                }
            }
        });
    }

    async getAchievements() {
        return await Achievement.findAll();
    }

    async getAchievementById(id: number) {
        const achievement = await Achievement.findByPk(id);

        if (!achievement) {
            throw ApiError.notFound('Достижение не найдено');
        }

        return achievement;
    }
}

export default new AchievementService();
