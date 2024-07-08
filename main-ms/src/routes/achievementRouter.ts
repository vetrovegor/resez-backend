import { Router } from "express";

import achievementController from "../controllers/achievementController";

export const achievementRouter = Router();

achievementRouter.get(
    '/',
    achievementController.getAchievements
);