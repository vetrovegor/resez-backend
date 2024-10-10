import { Request, Response, NextFunction } from 'express';

import achievementService from '../services/achievementService';
import { RequestWithUser } from 'types/request';

class AchievementController {    
    async getSecretAchievement(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            await achievementService.getSecretAchievement(req.user.id);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}

export default new AchievementController();
