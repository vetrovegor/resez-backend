import { Router } from "express";

import achievementController from "../../controllers/achievementController";
import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { permissionMiddleware } from "../../middlewares/permissionMiddleware";
import { Permissions } from "types/permission";

export const achievementRouter = Router();

achievementRouter.get(
    '/',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Admin),
    achievementController.getAchievementsForSelect
);