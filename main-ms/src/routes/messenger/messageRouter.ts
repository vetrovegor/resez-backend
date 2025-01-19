import { Router } from 'express';
import { body, param, query } from 'express-validator';

import messageController from '@controllers/messenger/messageController';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';

export const messageRouter = Router();

messageRouter.post(
    '/user/:id',
    param('id').isNumeric(),
    body('message')
        .if(
            (value, { req }) =>
                !Array.isArray(req.body.files) || req.body.files.length === 0
        )
        .isLength({ min: 1 }),
    body('files').isArray(),
    // TODO: по хорошему должен быть isURL, но с localhost не проходит валидацию
    body('files.*.url').isString(),
    body('files.*.name').isString(),
    body('files.*.type').isString(),
    body('files.*.size').isNumeric(),
    body('files.*.width').isNumeric().optional(),
    body('files.*.height').isNumeric().optional(),
    validationMiddleware,
    accessTokenMiddleware(true),
    messageController.sendMessageToUser
);

messageRouter.post(
    '/chat/:id',
    param('id').isNumeric(),
    body('message')
        .if(
            (value, { req }) =>
                !Array.isArray(req.body.files) || req.body.files.length === 0
        )
        .isLength({ min: 1 }),
    body('files').isArray(),
    // TODO: по хорошему должен быть isURL, но с localhost не проходит валидацию
    body('files.*.url').isString(),
    body('files.*.name').isString(),
    body('files.*.type').isString(),
    body('files.*.size').isNumeric(),
    body('files.*.width').isNumeric().optional(),
    body('files.*.height').isNumeric().optional(),
    body('parentMessageId').isNumeric().optional(),
    validationMiddleware,
    accessTokenMiddleware(true),
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
    messageController.readMessages
);

messageRouter.patch(
    '/:id/reaction',
    param('id').isNumeric(),
    body('reaction').isLength({ min: 1, max: 1 }),
    validationMiddleware,
    accessTokenMiddleware(true),
    messageController.setReactionToMessage
);
