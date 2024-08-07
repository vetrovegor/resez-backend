import { Router } from "express";
import { param } from "express-validator";

import subscriptionController from "../controllers/subscriptionController";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../middlewares/blockedMiddleware";

export const subscriptionRouter = Router();

subscriptionRouter.get(
    '/',
    subscriptionController.getSubscriptions
);

subscriptionRouter.get(
    '/buy/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    subscriptionController.buySubscription
);