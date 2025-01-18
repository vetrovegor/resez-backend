import { Router } from 'express';

import achievementController from '@controllers/achievementController';
import { permissionMiddleware } from '@middlewares/permissionMiddleware';
import { Permissions } from 'src/types/permission';

export const achievementRouter = Router();

achievementRouter.get(
    '/',
    permissionMiddleware(Permissions.Admin),
    achievementController.getAchievementsForSelect
);
