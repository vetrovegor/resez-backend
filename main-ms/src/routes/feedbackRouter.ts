import { Router } from "express";
import { body } from "express-validator";

import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware";
import feedbackController from "../controllers/feedbackController";

export const feedbackRouter = Router();

feedbackRouter.post(
    '/',
    body('text').isString(),
    optionalAuthMiddleware,
    feedbackController.createFeedback
);