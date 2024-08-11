import { Router } from "express";
import { body, param } from "express-validator";

import feedbackController from "../../controllers/feedbackController";
import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../middlewares/blockedMiddleware";
import { permissionMiddleware } from "../../middlewares/permissionMiddleware";
import { paginationMiddleware } from "../../middlewares/paginationMiddleware";
import { validationMiddleware } from "../../middlewares/validationMiddleware";
import { Permissions } from "types/permission";

export const feedbackRouter = Router();

feedbackRouter.get(
    '/',
    body('text').isString(),
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Complaints),
    paginationMiddleware,
    feedbackController.getFeedback
);

feedbackRouter.patch(
    '/:id/read',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Complaints),
    paginationMiddleware,
    feedbackController.readFeedback
);