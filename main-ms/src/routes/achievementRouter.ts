import { Router } from 'express';

import achievementController from '@controllers/achievementController';
import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';

export const achievementRouter = Router();

achievementRouter.get(
    '/secret',
    accessTokenMiddleware(true),
    achievementController.getSecretAchievement
);
