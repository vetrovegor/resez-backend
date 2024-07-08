import { Request, Response, NextFunction } from 'express';

import achievementService from '../services/achievementService';

class AchievementController {
    async getAchievements(req: Request, res: Response, next: NextFunction) {
        try {
            const achievements = await achievementService.getAchievements();

            res.json({ achievements });
        } catch (error) {
            next(error);
        }
    }
}

export default new AchievementController();
