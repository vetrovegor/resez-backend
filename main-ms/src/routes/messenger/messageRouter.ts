import { Router } from "express";
import { body, param, query } from "express-validator";

import messageController from "../../controllers/messenger/messageController";
import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { validationMiddleware } from "../../middlewares/validationMiddleware";
import { messageFilesMiddleware } from "../../middlewares/messenger/messageFilesMiddleware";

export const messageRouter = Router();

messageRouter.post(
    '/user/:id',
    param('id').isNumeric(),
    body('message').isLength({ min: 1 }),
    validationMiddleware,
    accessTokenMiddleware(true),
    messageFilesMiddleware,
    messageController.sendMessageToUser
);

messageRouter.post(
    '/chat/:id',
    param('id').isNumeric(),
    body('message').isLength({ min: 1 }),
    validationMiddleware,
    accessTokenMiddleware(true),
    messageFilesMiddleware,
    messageController.sendMessageToChat
);

messageRouter.patch(
    '/:id',
    param('id').isNumeric(),
    body('message').isLength({ min: 1 }),
    validationMiddleware,
    accessTokenMiddleware(true),
    messageController.editMessage
);

messageRouter.delete(
    '/',
    query('ids').isNumeric(),
    query('for_all').isBoolean().optional(),
    validationMiddleware,
    validationMiddleware,
    accessTokenMiddleware(true),
    messageController.deleteMessage
);

messageRouter.patch(
    '/:id/read',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    messageController.readMessage
);

messageRouter.get(
    '/:id/readers',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    messageController.getMessageReaders
);
