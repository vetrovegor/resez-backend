import { Router } from "express";
import { body, param } from "express-validator";

import messageController from "../../controllers/messenger/messageController";
import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../middlewares/blockedMiddleware";
import { validationMiddleware } from "../../middlewares/validationMiddleware";

export const messageRouter = Router();

messageRouter.post(
    '/user/:id',
    param('id').isNumeric(),
    body('message').isLength({ min: 1 }),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    messageController.sendMessageToUser
);

messageRouter.post(
    '/chat/:id',
    param('id').isNumeric(),
    body('message').isLength({ min: 1 }),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    messageController.sendMessageToChat
);

messageRouter.patch(
    '/:id',
    param('id').isNumeric(),
    body('message').isLength({ min: 1 }),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    messageController.editMessage
);

messageRouter.delete(
    '/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    messageController.deleteMessage
);